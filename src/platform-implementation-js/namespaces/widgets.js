/* @flow */

import Kefir from 'kefir';
import kefirCast from 'kefir-cast';

import ModalView from '../widgets/modal-view';
import MoleView from '../widgets/mole-view';
import DrawerView from '../widgets/drawer-view';
import TopMessageBarView from '../widgets/top-message-bar-view';
import ComposeView from '../views/compose-view';
import type { Driver, DrawerViewOptions } from '../driver-interfaces/driver';
import get from '../../common/get-or-fail';
import isComposeTitleBarLightColor from '../dom-driver/gmail/is-compose-titlebar-light-color';

// documented in src/docs/
class Widgets {
  constructor(appId: string, driver: Driver) {
    const members = { driver };
    memberMap.set(this, members);
  }

  showModalView(options: Object): ModalView {
    if (options.buttons) {
      options.buttons = options.buttons.map((button) => {
        if (button.onClick) {
          const appOnClick = button.onClick;
          return {
            ...button,
            onClick() {
              appOnClick({ modalView });
            },
          };
        }
        return button;
      });
    }
    const { driver } = get(memberMap, this);
    const modalViewDriver = driver.createModalViewDriver(options);
    const modalView = new ModalView({ driver, modalViewDriver });
    modalView.show();

    return modalView;
  }

  showMoleView(options: Object): MoleView {
    const moleViewDriver = get(memberMap, this).driver.createMoleViewDriver(
      options
    );
    const moleView = new MoleView({ moleViewDriver });
    moleViewDriver.show();

    return moleView;
  }

  showTopMessageBarView(options: Object): TopMessageBarView {
    const topMessageBarViewDriver = get(
      memberMap,
      this
    ).driver.createTopMessageBarDriver(kefirCast((Kefir: any), options));

    return new TopMessageBarView({
      topMessageBarViewDriver,
    });
  }

  showDrawerView(options: DrawerViewOptions): DrawerView {
    get(memberMap, this)
      .driver.getLogger()
      .eventSdkActive('Widgets.showDrawerView used', {
        keys: Object.keys(options),
      });

    if (options.composeView && !(options.composeView instanceof ComposeView))
      throw new Error('composeView option was not a ComposeView');
    const drawerViewDriver = get(memberMap, this).driver.createDrawerViewDriver(
      options
    );
    return new DrawerView(drawerViewDriver);
  }

  isMoleViewTitleBarLightColor(): boolean {
    return isComposeTitleBarLightColor();
  }
}

const memberMap: Map<Widgets, { driver: Driver }> = new Map();

export default Widgets;
