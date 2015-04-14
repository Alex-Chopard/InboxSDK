import _ from 'lodash';
import Kefir from 'kefir';
import kefirCast from 'kefir-cast';

import GmailElementGetter from '../gmail-element-getter';
import GmailRouteView from '../views/gmail-route-view/gmail-route-view';
import getURLObject from './get-url-object';
import escapeRegExp from '../../../../common/escape-reg-exp';

import Logger from '../../../lib/logger';

const routeIDtoRegExp = _.memoize(routeID =>
	new RegExp('^'+escapeRegExp(routeID).replace(/\/:[^/]+/g, '/([^/]+)')+'/?$')
);

function routeIDmatchesHash(routeID, hash) {
	const routeIDs = Array.isArray(routeID) ? routeID : [routeID];
	return _.find(routeIDs, routeID => hash.match(routeIDtoRegExp(routeID)));
}

// returns a Kefir stream
export default function setupRouteViewDriverStream(GmailRouteProcessor, driver) {
	const customRouteIDs = driver.getCustomRouteIDs();
	const customListRouteIDs = driver.getCustomListRouteIDs();
	const customListSearchStringsToRouteIds = driver.getCustomListSearchStringsToRouteIds();

	let lastNativeHash = getURLObject(document.location.href).hash;

	const eligibleHashChanges = Kefir.fromEvent(window, 'hashchange')
		.filter(event => !event.oldURL.match(/#inboxsdk-fake-no-vc$/))
		.filter(event => event.newURL === document.location.href) // ignore outdated events
		.map(() => getURLObject(document.location.href))
		.skipDuplicates((a, b) => a.hash === b.hash)
		.map(urlObject => {
			const hash = urlObject.hash;
			for (let routeIDs of customRouteIDs) {
				let routeID = routeIDmatchesHash(routeIDs, hash);
				if (routeID) {
					return {urlObject, type: 'CUSTOM', routeID};
				}
			}
			for (let [routeIDs] of customListRouteIDs) {
				let routeID = routeIDmatchesHash(routeIDs, hash);
				if (routeID) {
					return {urlObject, type: 'CUSTOM_LIST_TRIGGER', routeID};
				}
			}
			if (GmailRouteProcessor.isNativeRoute(urlObject.name)) {
				return {urlObject, type: 'NATIVE'};
			}
			return {urlObject, type: 'OTHER_APP_CUSTOM'};
		});

	const customAndCustomListRouteHashChanges = eligibleHashChanges
		.filter(({type}) => type !== 'NATIVE');

	// If a user goes from a native route to a custom route, and then back to the
	// same native route, we need to make a new GmailRouteView because
	// getMainContentElementChangedStream() won't be firing.
	const revertNativeHashChanges = eligibleHashChanges
		.filter(({type}) => type === 'NATIVE')
		.filter(({urlObject}) => {
			const tmp = lastNativeHash;
			lastNativeHash = urlObject.hash;
			return tmp === urlObject.hash;
		});


	let latestGmailRouteView;
	// Merge everything that can trigger a new RouteView
	return Kefir.merge([
		customAndCustomListRouteHashChanges,
		revertNativeHashChanges,

		//when native gmail changes main view there's a div that takes on role=main
		kefirCast(Kefir, GmailElementGetter.getMainContentElementChangedStream())
			.map(event => ({
				urlObject: getURLObject(document.location.href),
				type: 'NATIVE'
			}))
	]).map(options => {
		const {type, urlObject} = options;
		if (type === 'NATIVE' && urlObject.name === 'search') {
			const customListRouteId = customListSearchStringsToRouteIds.get(urlObject.params[0]);
			if (customListRouteId) {
				const searchInput = GmailElementGetter.getSearchInput();
				searchInput.value = '';

				if (urlObject.params.length === 1) {
					driver.hashChangeNoViewChange('#'+customListRouteId);
					return {
						type: 'CUSTOM_LIST', urlObject, routeID: customListRouteId
					};
				}
			}
		}
		return options;
	}).map(options => {
		if (options.type === 'NATIVE' || options.type === 'CUSTOM_LIST') {
			driver.showNativeRouteView();
		} else if (options.type === 'CUSTOM_LIST_TRIGGER') {
			driver.showCustomThreadList(options.routeID, customListRouteIDs.get(options.routeID));
			return;
		}
		return new GmailRouteView(options, GmailRouteProcessor);
	})
	.filter(Boolean)
	.tap((GmailRouteView) => {
		if(latestGmailRouteView){
			try{
				latestGmailRouteView.destroy();
			}
			catch(err){
				Logger.error(err, 'Failed to destroy latestGmailRouteView');

				_destroyGmailRouteView(latestGmailRouteView);
			}

		}

		latestGmailRouteView = GmailRouteView;
	});
}

function _destroyGmailRouteView(gmailRouteView){
	//manual destruction
	let rowListViews = latestGmailRouteView.getRowListViews();
	if(rowListViews && rowListViews.length > 0){
		rowListViews.forEach((rowListView) => {
			try{
				rowListView.destroy();
			}
			catch(err){
				Logger.error(err, 'Failed to destroy rowListView');
			}
		});
	}

	let threadView = gmailRouteView.getThreadView();
	if(threadView){
		try{
			threadView.destroy();
		}
		catch(err){
			Logger.error(err, 'Failed to destroy threadView');
		}
	}

	let eventStream = gmailRouteView.getEventStream();
	if(eventStream){
		try{
			eventStream.end();
		}
		catch(err){
			Logger.error(err, 'Failed to end GmailRouteView eventStream');
		}
	}
}

/**
 * TODO: Split up "role=main" DOM watching and hash change watching.
 *
 * SDK only cares about hash change when the hash goes to a route that the app registered as custom.
 * Otherwise it only responds to route changes when the role=main div changes.
 */
