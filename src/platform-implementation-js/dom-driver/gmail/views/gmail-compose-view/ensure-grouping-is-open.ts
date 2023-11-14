import { simulateClick } from '../../../../lib/dom/simulate-mouse-event';
export default function ensureGroupingIsOpen(
  gmailComposeViewElement: HTMLElement,
  type: string,
) {
  if (type === 'SEND_ACTION') {
    return; //we don't currently group send_actions
  }

  var groupedButton = gmailComposeViewElement.querySelector<HTMLElement>(
    '.inboxsdk__compose_groupedActionButton',
  );

  if (!groupedButton) {
    return; //no group button so we're good
  }

  if (
    gmailComposeViewElement.classList.contains(
      'inboxsdk__compose_groupedActionToolbar_visible',
    )
  ) {
    return; //we are already visible
  }

  simulateClick(groupedButton);
}
