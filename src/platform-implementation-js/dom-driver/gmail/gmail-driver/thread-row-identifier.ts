import type GmailDriver from '../gmail-driver';
import type GmailComposeView from '../views/gmail-compose-view';
import type GmailThreadRowView from '../views/gmail-thread-row-view';

// This object helps GmailThreadRowViews identify themselves if the normal
// method (ask the injected script) fails to work. This object keeps track of
// the open GmailComposeViews so it can
class ThreadRowIdentifier {
  _driver: GmailDriver;
  _composeViews: Set<GmailComposeView>;

  constructor(driver: GmailDriver) {
    this._driver = driver;
    this._composeViews = new Set();

    this._driver
      .getComposeViewDriverStream()
      .onValue((gmailComposeView: GmailComposeView) => {
        this._composeViews.add(gmailComposeView);

        gmailComposeView.getStopper().onValue(() => {
          this._composeViews.delete(gmailComposeView);
        });
      });
  }

  getThreadIdForThreadRow(
    gmailThreadRowView: GmailThreadRowView,
    elements: HTMLElement[]
  ): string | null | undefined {
    {
      const threadID = this._driver
        .getPageCommunicator()
        .getThreadIdForThreadRowByDatabase(elements[0]);
      if (threadID) {
        return threadID;
      }
    }

    if (
      gmailThreadRowView.getVisibleMessageCount() == 0 &&
      gmailThreadRowView.getVisibleDraftCount() > 0
    ) {
      const composeView = this._findComposeForThreadRow(gmailThreadRowView);
      if (composeView) {
        return composeView.getMessageID();
      }
    }

    // TODO fix or remove
    // eslint-disable-next-line
    if (false) {
      // Try identifying the row by simulating a ctrl-click on it. Note that if
      // the thread row corresponds to an open minimized draft, then we won't
      // get a result, and the compose will be restored, so we counteract that
      // here if we failed.
      const minimizedComposes = [];
      // eslint-disable-next-line prefer-const
      for (let composeView of this._composeViews) {
        const minimized = composeView.isMinimized();
        if (minimized) {
          minimizedComposes.push(composeView);
        }
      }
      const threadID = this._driver
        .getPageCommunicator()
        .getThreadIdForThreadRowByClick(elements[0]);
      if (threadID) {
        return threadID;
      }
      // eslint-disable-next-line prefer-const
      for (let composeView of minimizedComposes) {
        composeView.setMinimized(true);
      }
    }

    return null;
  }

  async getDraftIdForThreadRow(
    gmailThreadRowView: GmailThreadRowView
  ): Promise<string | null | undefined> {
    if (
      gmailThreadRowView.getVisibleMessageCount() > 0 ||
      gmailThreadRowView.getVisibleDraftCount() == 0
    ) {
      return Promise.resolve(null);
    }

    const composeView = this._findComposeForThreadRow(gmailThreadRowView);
    if (composeView) {
      return composeView.getDraftID();
    }

    const { draftID } = await this._driver.getDraftIDForMessageID(
      gmailThreadRowView.getThreadID()
    );
    return draftID;
  }

  _findComposeForThreadRow(
    gmailThreadRowView: GmailThreadRowView
  ): GmailComposeView | null | undefined {
    const candidates = [];
    const subject = gmailThreadRowView.getSubject();
    // eslint-disable-next-line prefer-const
    for (let gmailComposeView of this._composeViews) {
      if (subject === gmailComposeView.getSubject()) {
        candidates.push(gmailComposeView);
      }
    }
    if (candidates.length == 1) {
      return candidates[0];
    }
    return null;
  }
}

export default ThreadRowIdentifier;
