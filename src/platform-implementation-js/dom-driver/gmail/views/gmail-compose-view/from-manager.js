/* @flow */

import find from 'lodash/find';
import { simulateClick } from '../../../../lib/dom/simulate-mouse-event';
import type GmailDriver from '../../gmail-driver';
import type GmailComposeView from '../../views/gmail-compose-view';

export function getFromContact(
  driver: GmailDriver,
  gmailComposeView: GmailComposeView
): Contact {
  const nameInput: ?HTMLInputElement = (gmailComposeView
    .getElement()
    .querySelector('input[name="from"]'): any);
  const emailAddress = nameInput ? nameInput.value : null;
  if (!emailAddress) {
    return driver.getUserContact();
  }
  const fromContactChoices = getFromContactChoices(driver, gmailComposeView);
  const matchingContact: ?Contact = find(
    fromContactChoices,
    (contact) => contact.emailAddress === emailAddress
  );
  let name;
  if (!matchingContact) {
    name = emailAddress;
    driver.getLogger().error(new Error('getFromContact failed to find name'), {
      fromContactChoicesLength: fromContactChoices.length,
    });
  } else {
    name = matchingContact.name;
  }
  return { emailAddress, name };
}

export function getFromContactChoices(
  driver: GmailDriver,
  gmailComposeView: GmailComposeView
): Contact[] {
  const choiceEls = gmailComposeView
    .getElement()
    .querySelectorAll(
      'div.J-M.jQjAxd.J-M-awS[role=menu] > div.SK.AX > div[value][role=menuitem]'
    );
  if (choiceEls.length == 0) {
    // From field isn't present
    return [driver.getUserContact()];
  }
  return Array.from(choiceEls).map((item) => ({
    emailAddress: item.getAttribute('value') || '',
    name: item.textContent.replace(/<.*/, '').trim(),
  }));
}

export function setFromEmail(
  driver: GmailDriver,
  gmailComposeView: GmailComposeView,
  email: string
) {
  const currentFromAddress = gmailComposeView.getFromContact().emailAddress;
  if (currentFromAddress === email) {
    return;
  }

  const choiceParent = gmailComposeView
    .getElement()
    .querySelector('div.J-M.jQjAxd.J-M-awS[role=menu] > div.SK.AX');
  if (!choiceParent) {
    if (driver.getUserContact().emailAddress != email) {
      throw new Error('Chosen email from choice was not found');
    }
    return;
  }
  const chosenChoice = find(
    choiceParent.children,
    (item) => item.getAttribute('value') == email
  );
  if (!chosenChoice) {
    throw new Error('Chosen email from choice was not found');
  }
  simulateClick(chosenChoice);
}
