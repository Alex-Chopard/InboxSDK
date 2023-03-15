import { simulateClick } from '../../../lib/dom/simulate-mouse-event';
import GmailElementGetter from '../gmail-element-getter';

import waitFor from '../../../lib/wait-for';

import type GmailDriver from '../gmail-driver';

export default async function openComposeWindow(_gmailDriver: GmailDriver) {
  await GmailElementGetter.waitForGmailModeToSettle();

  if (
    GmailElementGetter.isStandaloneComposeWindow() ||
    GmailElementGetter.isStandaloneThreadWindow()
  ) {
    throw new Error('Can not open new compose while in standalone window');
  }

  if (!GmailElementGetter.getComposeButton()) {
    await waitFor(() => !!GmailElementGetter.getComposeButton());
  }

  const composeButton = GmailElementGetter.getComposeButton();
  if (!composeButton) throw new Error('Could not find compose button');
  simulateClick(composeButton);
}
