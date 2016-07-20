/* @flow */

import {defn} from 'ud';
import Kefir from 'kefir';
import kefirStopper from 'kefir-stopper';
import InboxBackdrop from './inbox-backdrop';
import type {DrawerViewOptions} from '../../../driver-interfaces/driver';
import findParent from '../../../lib/dom/find-parent';

class InboxDrawerView {
  _chrome: boolean;
  _exitEl: HTMLElement;
  _containerEl: HTMLElement;
  _el: HTMLElement;
  _backdrop: InboxBackdrop;
  _slideAnimationDone: Kefir.Stream;
  _closing: Kefir.Stream&{destroy():void} = kefirStopper();
  _closed: Kefir.Stream&{destroy():void} = kefirStopper();

  constructor(options: DrawerViewOptions) {
    this._chrome = typeof options.chrome === 'boolean' ? options.chrome : true;

    const zIndex = 500;
    let target = document.body;

    const id = `${Date.now()}-${Math.random()}`;
    const {composeView} = options;
    if (composeView) {
      if (composeView.isMinimized()) {
        throw new Error("Can't attach DrawerView to minimized ComposeView");
      }
      if (composeView.isInlineReplyForm()) {
        throw new Error("Can't attach DrawerView to inline ComposeView");
      }
      const isFullscreenInboxCompose = composeView.isFullscreen() &&
        document.location.origin === 'https://inbox.google.com';
      if (isFullscreenInboxCompose) {
        composeView.setFullscreen(false);
      }
      Kefir.merge([
        Kefir.fromEvents(composeView, 'destroy'),
        Kefir.fromEvents(composeView, 'minimized'),
        Kefir.fromEvents(composeView, 'restored'),
        Kefir.later(10).flatMap(() =>
          Kefir.fromEvents(composeView, 'fullscreenChanged')
        )
      ])
        .takeUntilBy(this._closing)
        .onValue(() => this.close());

      // Figure out where we're going to stick our DrawerView in the DOM, and
      // set up the z-indexes of the ComposeView and the target point so
      // everything will look right.
      const composeEl = composeView.getElement();
      const {offsetParent} = composeEl;
      if (!(offsetParent instanceof HTMLElement)) throw new Error('should not happen');
      target = findParent(
        offsetParent,
        el => window.getComputedStyle(el).getPropertyValue('z-index') !== 'auto'
      ) || document.body;
      composeEl.setAttribute('data-drawer-owner', id);
      target.classList.add('inboxsdk__drawers_in_use');
      target.setAttribute('data-drawer-owner', id);
      target.style.zIndex = '500';
      offsetParent.setAttribute('data-drawer-owner', id);
      if (!offsetParent.hasAttribute('data-drawer-old-zindex')) {
        offsetParent.setAttribute('data-drawer-old-zindex', offsetParent.style.zIndex);
      }
      offsetParent.style.zIndex = String(zIndex+1);
      this._closed.onValue(() => {
        if (composeEl.getAttribute('data-drawer-owner') === id) {
          composeEl.removeAttribute('data-drawer-owner');
        }
        if (target.getAttribute('data-drawer-owner') === id) {
          target.style.zIndex = '';
          target.removeAttribute('data-drawer-owner');
        }
        if (offsetParent.getAttribute('data-drawer-owner') === id) {
          offsetParent.style.zIndex = offsetParent.getAttribute('data-drawer-old-zindex');
          offsetParent.removeAttribute('data-drawer-owner');
          offsetParent.removeAttribute('data-drawer-old-zindex');
        }
      });
    }

    this._backdrop = new InboxBackdrop(zIndex, target);
    this._backdrop.getStopper().takeUntilBy(this._closing).onValue(() => {
      this.close();
    });

    this._containerEl = document.createElement('div');
    this._containerEl.className = 'inboxsdk__drawer_view_container';
    this._containerEl.style.zIndex = String(zIndex+2);

    this._el = document.createElement('div');
    this._el.setAttribute('role', 'dialog');
    this._el.tabIndex = 0;
    this._el.className = 'inboxsdk__drawer_view';
    this._containerEl.appendChild(this._el);

    if (this._chrome) {
      const titleBar = document.createElement('div');
      titleBar.className = 'inboxsdk__drawer_title_bar';

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.title = 'Close';
      closeButton.className = 'inboxsdk__close_button';
      (closeButton:any).addEventListener('click', () => {
        this.close();
      });
      titleBar.appendChild(closeButton);

      const title = document.createElement('div');
      title.className = 'inboxsdk__drawer_title';
      title.setAttribute('role', 'heading');
      title.textContent = options.title;
      titleBar.appendChild(title);

      this._el.appendChild(titleBar);
    }

    this._el.appendChild(options.el);

    target.appendChild(this._containerEl);

    this._closing.onValue(() => {
      this._backdrop.destroy();
      this._el.classList.remove('inboxsdk__active');
      Kefir.fromEvents(this._el, 'transitionend')
        .merge(Kefir.later(200)) // transition might not finish if element is hidden
        .take(1)
        .onValue(() => {
          this._closed.destroy();
          this._containerEl.remove();
        });
    });

    // Move or resize the ComposeView so that it's not clipped by the DrawerView.
    let composeNeedToMoveLeft = 0;
    if (composeView) {
      const composeEl = composeView.getElement();
      const composeRect = composeEl.getBoundingClientRect();
      const drawerRect = this._el.getBoundingClientRect();

      const margin = 24;
      const preexistingLeftAdjustment = parseInt(composeEl.style.left) || 0;
      composeNeedToMoveLeft = composeRect.right - preexistingLeftAdjustment -
        (window.innerWidth - drawerRect.width - margin);
      if (composeNeedToMoveLeft > 0) {
        composeEl.style.position = 'relative';
        composeEl.style.transition = 'left 150ms cubic-bezier(.4,0,.2,1)';
        composeEl.style.left = '0';
        composeEl.offsetHeight; // force layout of compose
        // We only want to force a full layout once, so let's not dirty the DOM
        // again until after we've forced layout of the DrawerView _el too.
      }
    }

    this._el.offsetHeight; // force layout so that adding a class does a transition.
    this._el.classList.add('inboxsdk__active');
    this._slideAnimationDone = Kefir.fromEvents(this._el, 'transitionend')
      .take(1)
      .takeUntilBy(this._closing)
      .map(() => null);

    // Continue ComposeView positioning after forcing a layout above.
    if (composeView && composeNeedToMoveLeft > 0) {
      const composeEl = composeView.getElement();
      composeEl.style.left = `${-composeNeedToMoveLeft}px`;

      this._closing.onValue(() => {
        if (composeEl.getAttribute('data-drawer-owner') === id) {
          composeEl.style.left = '0';
        }
      });
      this._closed.onValue(() => {
        if (!composeEl.hasAttribute('data-drawer-owner')) {
          composeEl.style.position = '';
          composeEl.style.left = '';
          composeEl.style.transition = '';
        }
      });
    }
  }

  getSlideAnimationDone() {
    return this._slideAnimationDone;
  }

  getClosingStream() {
    return this._closing;
  }

  getClosedStream() {
    return this._closed;
  }

  close() {
    this._closing.destroy();
  }
}

export default defn(module, InboxDrawerView);
