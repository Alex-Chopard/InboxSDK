import Kefir from 'kefir';
import EventEmitter from '../lib/safe-event-emitter';
import ComposeView from '../views/compose-view';
import type { DrawerViewDriver } from '../driver-interfaces/driver';

class DrawerView extends EventEmitter {
  destroyed: boolean = false;
  _driver: DrawerViewDriver;

  constructor(drawerViewDriver: DrawerViewDriver) {
    super();
    this._driver = drawerViewDriver;

    this._driver.getSlideAnimationDone().onValue(() => {
      this.emit('slideAnimationDone');
    });

    this._driver.getClosingStream().onValue(() => {
      this.emit('closing');
    });

    this._driver.getClosedStream().onValue(() => {
      this.destroyed = true;
      this.emit('destroy');
    });

    this._driver.getPreAutoCloseStream().onValue((event) => {
      this.emit('preautoclose', event);
    });

    document.dispatchEvent(
      new CustomEvent('inboxSDKcloseDrawers', {
        bubbles: false,
        cancelable: false,
        detail: null,
      }),
    );
    Kefir.fromEvents(document, 'inboxSDKcloseDrawers')
      .takeUntilBy(Kefir.fromEvents(this, 'closing'))
      .onValue(() => {
        this.close();
      });
  }

  close() {
    this._driver.close();
  }

  associateComposeView(composeView: ComposeView, closeWithCompose: boolean) {
    if (!(composeView instanceof ComposeView))
      throw new Error('argument was not a ComposeView');

    this._driver.associateComposeView(composeView, closeWithCompose);
  }

  disassociateComposeView() {
    this._driver.disassociateComposeView();
  }
}

export default DrawerView;
