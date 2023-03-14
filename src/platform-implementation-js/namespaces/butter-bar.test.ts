import _ from 'lodash';
import Kefir from 'kefir';
import kefirBus from 'kefir-bus';

import ButterBar from './butter-bar';

class MockButterBarDriver {
  private _queue: any[] = [];
  private _openBus = kefirBus<any, any>();
  private _showMessageCount: number = 0;
  private _currentMessage: any = null;
  private _hideGmailMessageCount: number = 0;

  getNoticeAvailableStream() {
    return this._openBus;
  }
  showMessage(options: any) {
    const num = ++this._showMessageCount;
    this._currentMessage = options;
    return {
      destroy: () => {
        if (num === this._showMessageCount) {
          this._currentMessage = null;
          this._openBus.value(undefined);
        }
      },
    };
  }
  getSharedMessageQueue() {
    return _.cloneDeep(this._queue);
  }
  setSharedMessageQueue(queue: any[]) {
    this._queue = _.cloneDeep(queue);
  }
  hideGmailMessage() {
    this._hideGmailMessageCount++;
  }
}

describe('showMessage', () => {
  it("doesn't fail", () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);
    const options = { text: 'a' };
    const message = butterBar.showMessage(options);
    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options);
    message.destroy();
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
  });

  it('destroys on route change', (done) => {
    const routeViewDriverStream = kefirBus();
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(routeViewDriverStream.toProperty()),
    };
    const butterBar = new ButterBar('test', driver);
    butterBar.showMessage({ text: 'a' });
    // Route view changes shouldn't be listened to immediately by butterbar.
    // This first route view change shouldn't kill things.
    routeViewDriverStream.emit({});
    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBeTruthy();

    setTimeout(() => {
      expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
      expect(driver.getButterBarDriver()._currentMessage).toBeTruthy();
      routeViewDriverStream.emit({});
      expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
      expect(driver.getButterBarDriver()._currentMessage).toBe(null);
      done();
    }, 1);
  });

  it('destroys after given time passes', (done) => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);
    butterBar.showMessage({ text: 'a', time: 1 });

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBeTruthy();

    setTimeout(() => {
      expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
      expect(driver.getButterBarDriver()._currentMessage).toBe(null);
      done();
    }, 1);
  });

  it("low priority messages don't interrupt higher priority messages", () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);
    const options1 = { text: 'a', priority: 2 };
    const message1 = butterBar.showMessage(options1);
    const options2 = { text: 'b', priority: 1 };
    const message2 = butterBar.showMessage(options2);
    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);
    message1.destroy();
    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
    message2.destroy();
    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
  });

  it('low priority persistent messages queue up', () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);
    const options1 = { text: 'a', priority: 2 };
    const message1 = butterBar.showMessage(options1);
    const options2 = { text: 'b', priority: 1, persistent: true };
    const message2 = butterBar.showMessage(options2);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    const options3 = { text: 'c', priority: 2 };
    const message3 = butterBar.showMessage(options3);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options3);

    message1.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options3);

    message3.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(3);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options2);

    message2.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(3);
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
  });

  it('messages of equal or higher priority interrupt others', () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    const options1 = { text: 'a', priority: 2 };
    const message1 = butterBar.showMessage(options1);
    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    const options2 = { text: 'b', priority: 2 };
    const message2 = butterBar.showMessage(options2);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options2);

    message1.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options2);

    message2.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
  });

  it("interrupted messages come back if they're persistent", () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    const options1 = { text: 'a', priority: 2, persistent: true };
    const message1 = butterBar.showMessage(options1);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    const options2 = { text: 'b', priority: 2 };
    const message2 = butterBar.showMessage(options2);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options2);

    message2.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(3);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    message1.destroy();

    expect(driver.getButterBarDriver()._showMessageCount).toBe(3);
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
  });
});

describe('showSaving', () => {
  it('resolves', (done) => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(0);

    const options1 = {};
    const message1 = butterBar.showSaving(options1);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    message1.resolve();

    setTimeout(() => {
      expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
      expect(driver.getButterBarDriver()._currentMessage).not.toBe(options1);
      expect(driver.getButterBarDriver()._currentMessage).toBeTruthy();
      done();
    }, 4);
  });

  it('respects showConfirmation', (done) => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(0);

    const options1 = { showConfirmation: false };
    const message1 = butterBar.showSaving(options1);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    message1.resolve();

    setTimeout(() => {
      expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
      expect(driver.getButterBarDriver()._currentMessage).toBe(null);
      done();
    }, 4);
  });

  it('rejects', (done) => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(0);

    const options1 = {};
    const message1 = butterBar.showSaving(options1);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    message1.reject();

    setTimeout(() => {
      expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
      expect(driver.getButterBarDriver()._currentMessage).toBe(null);
      done();
    }, 4);
  });

  it('has a high priority saved message', (done) => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(0);

    const options1 = { text: 'blah' };
    const message1 = butterBar.showMessage(options1);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    const options2 = {};
    const message2 = butterBar.showSaving(options2);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    message2.resolve();

    setTimeout(() => {
      expect(driver.getButterBarDriver()._showMessageCount).toBe(2);
      expect(driver.getButterBarDriver()._currentMessage).not.toBe(options1);
      expect(driver.getButterBarDriver()._currentMessage).not.toBe(options2);
      expect(driver.getButterBarDriver()._currentMessage).toBeTruthy();
      message1.destroy();
      done();
    }, 4);
  });
});

describe('hideMessage', () => {
  it('works', () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    const options1 = { text: 'a', messageKey: {}, priority: 100 };
    butterBar.showMessage(options1);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    butterBar.hideMessage({});

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(options1);

    butterBar.hideMessage(options1.messageKey);

    expect(driver.getButterBarDriver()._showMessageCount).toBe(1);
    expect(driver.getButterBarDriver()._currentMessage).toBe(null);
  });
});

describe('hideGmailMessage', () => {
  it('calls driver', () => {
    const driver: any = {
      getButterBarDriver: _.constant(new MockButterBarDriver()),
      getRouteViewDriverStream: _.constant(Kefir.never().toProperty()),
    };
    const butterBar = new ButterBar('test', driver);

    expect(driver.getButterBarDriver()._hideGmailMessageCount).toBe(0);
    butterBar.hideGmailMessage();
    expect(driver.getButterBarDriver()._hideGmailMessageCount).toBe(1);
  });
});
