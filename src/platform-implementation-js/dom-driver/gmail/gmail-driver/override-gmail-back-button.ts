import { defn } from 'ud';
import GmailElementGetter from '../gmail-element-getter';
import onMouseDownAndUp from '../../../lib/dom/on-mouse-down-and-up';
import type GmailDriver from '../gmail-driver';
import type GmailRouteView from '../views/gmail-route-view/gmail-route-view';
import type GmailRouteProcessor from '../views/gmail-route-view/gmail-route-processor';

export default function overrideGmailBackButton(
  gmailDriver: GmailDriver,
  gmailRouteProcessor: GmailRouteProcessor,
) {
  GmailElementGetter.waitForGmailModeToSettle().then(function () {
    if (GmailElementGetter.isStandalone()) {
      return;
    }
    _setupManagement(gmailDriver, gmailRouteProcessor);
  });
}

function _setupManagement(
  gmailDriver: GmailDriver,
  gmailRouteProcessor: GmailRouteProcessor,
) {
  gmailDriver
    .getRouteViewDriverStream()
    .scan(
      (
        prev: { gmailRouteView: GmailRouteView } | null | undefined,
        gmailRouteView: GmailRouteView,
      ) => {
        let lastCustomRouteID, lastCustomRouteParams;
        if (
          prev &&
          prev.gmailRouteView &&
          prev.gmailRouteView.isCustomRouteBelongingToApp()
        ) {
          lastCustomRouteID = prev.gmailRouteView.getRouteID();
          lastCustomRouteParams = prev.gmailRouteView.getParams();
        }
        return { gmailRouteView, lastCustomRouteID, lastCustomRouteParams };
      },
      undefined,
    )
    .changes()
    .onValue(
      ({ gmailRouteView, lastCustomRouteID, lastCustomRouteParams }: any) => {
        handleGmailRouteView(
          gmailRouteView,
          lastCustomRouteID,
          lastCustomRouteParams,
          gmailDriver,
          gmailRouteProcessor,
        );
      },
    );
}

const handleGmailRouteView = defn(
  module,
  function handleGmailRouteView(
    gmailRouteView: GmailRouteView,
    lastCustomRouteID: string | null | undefined,
    lastCustomRouteParams: any,
    gmailDriver: GmailDriver,
    gmailRouteProcessor: GmailRouteProcessor,
  ) {
    if (
      lastCustomRouteID &&
      gmailRouteView.getRouteType() === gmailRouteProcessor.RouteTypes.THREAD
    ) {
      _bindToBackButton(gmailDriver, gmailRouteView);
    }
  },
);

function _bindToBackButton(
  gmailDriver: GmailDriver,
  gmailRouteView: GmailRouteView,
) {
  const backButton = GmailElementGetter.getThreadBackButton();

  if (!backButton) {
    return;
  }

  onMouseDownAndUp(backButton)
    .takeUntilBy(gmailRouteView.getStopper())
    .filter((e) => !e.defaultPrevented)
    .onValue((e) => {
      window.history.back();
      e.preventDefault();
      e.stopImmediatePropagation();
    });
}
