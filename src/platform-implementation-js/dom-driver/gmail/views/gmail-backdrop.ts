import * as Kefir from 'kefir';
import kefirStopper from 'kefir-stopper';

class GmailBackdrop {
  _stopper: Kefir.Observable<null, unknown> & { destroy(): void } =
    kefirStopper();

  constructor(zIndex: number = 500, target: HTMLElement = document.body) {
    const el = document.createElement('div');
    el.className = 'Kj-JD-Jh inboxsdk__modal_overlay';
    el.style.zIndex = String(zIndex);
    if (!target) throw new Error('no target');
    target.appendChild(el);

    this._stopper.onValue(() => {
      el.remove();
    });
  }

  getStopper(): Kefir.Observable<null, unknown> {
    return this._stopper;
  }

  destroy() {
    this._stopper.destroy();
  }
}

export default GmailBackdrop;
