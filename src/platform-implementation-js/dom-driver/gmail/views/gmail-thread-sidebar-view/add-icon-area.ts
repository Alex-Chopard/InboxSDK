import { defn } from 'ud';
import * as Kefir from 'kefir';
import makeMutationObserverChunkedStream from '../../../../lib/dom/make-mutation-observer-chunked-stream';

/*
As of Dec 2nd, 2017.
  div.bvq  - the container for both native icons and loading area
    div:first-child  - the loading visualization div
    div.J-KU-Jg[role=tablist]  - where the native icons show up


div.bvq can be display none sometimes, we don't ever want that to happen
so in css we force div.bvq to be visible (search for "div.bvq" in gmail.css)

There are 3 states that the native icon area can be in:
1. first time you go to a thread in that session, or the user has no add-ons
  div.bvq is style display none
  loading visualization div is display none
  tablist div does not have [role=tablist]

put our icon area between the loading visualization and the native tablist.
If the tablist ever gets shown, then we put our sdk icons area in the tablist

2. subsequent times you go to a thread and the addons are loading
  div.bvq is visible
  loading visualization is visible
  tablist div has [role=tablist] but is display none

In this case we want to put our icon area between loading visualization and
native tablist. We then clone the loading html and put it in our area. Once everything is
loaded we go to 3rd state.

3. Addons are done loading
  div.bvq is visible
  loading visualization display none
  tablist displayed
*/
const TAB_LIST_SELECTOR = '[role=tablist],.J-KU-Jg';

function addIconArea(
  iconArea: HTMLElement,
  addonSidebarContainerEl: HTMLElement,
  stopper: Kefir.Observable<any, any>
) {
  const nativeIconArea = addonSidebarContainerEl.firstElementChild;
  if (!nativeIconArea) return;
  const loadingHolderAsAny: any = nativeIconArea.firstElementChild;
  const loadingHolder = loadingHolderAsAny as HTMLElement | null | undefined;
  if (!loadingHolder) return;
  const tabList =
    addonSidebarContainerEl.querySelector<HTMLElement>(TAB_LIST_SELECTOR);
  if (!tabList) return;
  // emits when the loading div display style changes
  const loadingDivIsDisplayedStream = makeMutationObserverChunkedStream(
    loadingHolder,
    {
      attributes: true,
      attributeFilter: ['style'],
    }
  )
    .toProperty(() => null)
    .map(() => loadingHolder.style.display !== 'none')
    .takeUntilBy(stopper);
  // emits when the tablist div gets role=tablist
  const tabListRoleStream = makeMutationObserverChunkedStream(tabList, {
    attributes: true,
    attributeFilter: ['role'],
  })
    .toProperty(() => null)
    .filter(() => tabList.getAttribute('role') === 'tablist')
    .takeUntilBy(stopper);
  // first we add sdk icon container as previous sibling to native tablist
  tabList.insertAdjacentElement('beforebegin', iconArea);
  // now we wait for loading to be hidden and tablist to be formed, and then we
  // add sdk icon container to tablist
  Kefir.combine([
    loadingDivIsDisplayedStream.filter((value) => !value),
    tabListRoleStream,
  ]).onValue(() => {
    tabList.insertAdjacentElement('afterbegin', iconArea);
    maintainIconArea(
      iconArea,
      tabList,
      Kefir.merge([loadingDivIsDisplayedStream.filter(Boolean), stopper])
    );
  });
  // if the addon loading div becomes visible then we create a clone of it and put the clone in a
  // better place that works with our icons better. the native addon loading div is hidden with css
  // but the style attribute still gets modified by gmail so we know when the loading should go away
  loadingDivIsDisplayedStream.filter(Boolean).onValue(() => {
    const loadingClone = document.createElement('div');
    loadingClone.innerHTML = loadingHolder.innerHTML;
    loadingClone.classList.add('inboxsdk__addon_icon_loading');
    tabList.insertAdjacentElement('beforebegin', iconArea);
    iconArea.insertAdjacentElement('afterend', loadingClone);
    Kefir.merge([
      loadingDivIsDisplayedStream.filter((value) => !value),
      stopper,
    ])
      .take(1)
      .onValue(() => {
        loadingClone.remove();
      });
  });
}

// Gmail periodically clears the children of this element before it's
// visible, so we fight back.
function maintainIconArea(
  iconArea: Element,
  tabList: HTMLElement,
  stopper: any
) {
  makeMutationObserverChunkedStream(tabList, {
    childList: true,
  })
    .filter(() => iconArea.parentElement !== tabList)
    .takeUntilBy(stopper)
    .onValue(() => {
      tabList.insertAdjacentElement('afterbegin', iconArea);
    });
}

export default defn(module, addIconArea);
