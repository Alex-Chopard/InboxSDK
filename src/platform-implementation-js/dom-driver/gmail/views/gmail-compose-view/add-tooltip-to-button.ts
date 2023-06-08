import * as Kefir from 'kefir';
import Logger from '../../../../lib/logger';
import GmailTooltipView from '../../widgets/gmail-tooltip-view';
import type GmailComposeView from '../gmail-compose-view';
import type { TooltipDescriptor } from '../../../../views/compose-button-view';
import BasicButtonViewController from '../../../../widgets/buttons/basic-button-view-controller';
export default function addTooltipToButton(
  gmailComposeView: GmailComposeView,
  buttonViewController: BasicButtonViewController,
  buttonDescriptor: Record<string, any>,
  tooltipDescriptor: TooltipDescriptor
): GmailTooltipView {
  var gmailTooltipView = new GmailTooltipView(tooltipDescriptor);
  var tooltipStopperStream: Kefir.Observable<any, unknown> = gmailTooltipView
    .getStopper()
    .merge(gmailComposeView.getStopper());
  gmailComposeView
    .getStopper()
    .takeUntilBy(gmailTooltipView.getStopper())
    .onValue(() => gmailTooltipView.destroy());
  (document.body as any as HTMLElement).appendChild(
    gmailTooltipView.getElement()
  );

  _anchorTooltip(
    gmailTooltipView,
    gmailComposeView,
    buttonViewController,
    buttonDescriptor
  );

  gmailComposeView
    .getEventStream()
    .filter(
      (event) =>
        event.eventName === 'buttonAdded' ||
        event.eventName === 'fullscreenChanged'
    )
    .merge(
      gmailTooltipView
        .getEventStream()
        .filter(({ eventName }) => eventName === 'imageLoaded')
    )
    .debounce(10)
    .takeUntilBy(tooltipStopperStream)
    .onValue(
      _anchorTooltip.bind(
        null,
        gmailTooltipView,
        gmailComposeView,
        buttonViewController,
        buttonDescriptor
      )
    );
  buttonViewController
    .getView()
    .getEventStream()
    .takeUntilBy(tooltipStopperStream)
    .filter(function (event) {
      return event.eventName === 'click';
    })
    .onValue(gmailTooltipView.destroy.bind(gmailTooltipView));
  var stoppedIntervalStream = Kefir.interval(50, undefined).takeUntilBy(
    tooltipStopperStream
  );
  var left = 0;
  var top = 0;
  stoppedIntervalStream
    .takeWhile(
      () => !!buttonViewController.getView() && !!gmailTooltipView.getElement()
    )
    .map(() =>
      buttonViewController.getView().getElement().getBoundingClientRect()
    )
    .filter((rect) => rect.left !== left || rect.top !== top)
    .map((rect) => {
      left = rect.left;
      top = rect.top;
      return rect;
    })
    .onValue(
      gmailTooltipView.anchor.bind(
        gmailTooltipView,
        buttonViewController.getView().getElement(),
        {
          position: 'top',
        }
      )
    );
  stoppedIntervalStream
    .filter(
      () =>
        !buttonViewController.getView() ||
        !buttonViewController.getView().getElement().offsetParent
    )
    .onValue(gmailTooltipView.destroy.bind(gmailTooltipView));
  return gmailTooltipView;
}

function _anchorTooltip(
  gmailTooltipView: GmailTooltipView,
  gmailComposeView: GmailComposeView,
  buttonViewController: BasicButtonViewController,
  buttonDescriptor: any
) {
  try {
    gmailComposeView.ensureGroupingIsOpen(buttonDescriptor.type);
    setTimeout(function () {
      gmailTooltipView.anchor(buttonViewController.getView().getElement(), {
        position: 'top',
      });
    }, 10);
  } catch (err) {
    Logger.error(err);
  }
}
