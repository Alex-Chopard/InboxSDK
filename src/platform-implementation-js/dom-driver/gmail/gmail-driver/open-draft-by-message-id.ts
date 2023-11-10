import qs from 'querystring';

import getSyncThreadsForSearch from '../../../driver-common/getSyncThreadsForSearch';

import GmailDriver from '../gmail-driver';
import encodeDraftUrlId from './encodeDraftUrlId';
import getRfcMessageIdForGmailMessageId from './get-rfc-message-id-for-gmail-message-id';

export default async function openDraftByMessageID(
  driver: GmailDriver,
  messageID: string,
) {
  const rfcMessageID = await getRfcMessageIdForGmailMessageId(
    driver,
    messageID,
  );
  const { threads } = await getSyncThreadsForSearch(
    driver,
    'rfc822msgid:' + rfcMessageID,
  );

  if (threads.length === 0) {
    throw new Error('Failed to get sync message id');
  }

  const thread = threads[0];
  const syncMessageData = thread.extraMetaData.syncMessageData.find(
    (m) => m.oldMessageID === messageID,
  );
  if (!syncMessageData) {
    throw new Error('Failed to find syncMessageData');
  }

  const { syncMessageID } = syncMessageData;

  const newHash = makeNewSyncHash(
    window.location.hash,
    thread.syncThreadID,
    syncMessageID,
  );
  window.location.hash = newHash;
}

export function makeNewHash(oldHash: string, messageID: string): string {
  oldHash = '#' + oldHash.replace(/^#/, '');
  const [pre, query] = oldHash.split('?');
  const params = qs.parse(query);
  if (params.compose) {
    params.compose += ',' + messageID;
  } else {
    params.compose = messageID;
  }
  return pre + '?' + qs.stringify(params);
}

export function makeNewSyncHash(
  oldHash: string,
  syncThreadID: string,
  syncMessageID: string,
): string {
  oldHash = '#' + oldHash.replace(/^#/, '');
  const [pre, query] = oldHash.split('?');
  const params = qs.parse(query);
  params.compose = encodeDraftUrlId(syncThreadID, syncMessageID);

  return pre + '?' + qs.stringify(params);
}
