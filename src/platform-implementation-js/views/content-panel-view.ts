/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Kefir from 'kefir';
import EventEmitter from '../lib/safe-event-emitter';
import get from '../../common/get-or-fail';
import type ContentPanelViewDriver from '../driver-common/sidebar/ContentPanelViewDriver';
interface Members {
  contentPanelViewImplementation: ContentPanelViewDriver;
}
const membersMap = new WeakMap<ContentPanelView, Members>(); // documented in src/docs/

export default class ContentPanelView extends EventEmitter {
  destroyed: boolean = false;

  constructor(contentPanelViewImplementation: ContentPanelViewDriver) {
    super();
    const members = {
      contentPanelViewImplementation,
    };
    membersMap.set(this, members);

    this._bindToStreamEvents();
  }

  remove() {
    get(membersMap, this).contentPanelViewImplementation.remove();
  }

  close() {
    get(membersMap, this).contentPanelViewImplementation.close();
  }

  open() {
    get(membersMap, this).contentPanelViewImplementation.open();
  }

  isActive(): boolean {
    return get(membersMap, this).contentPanelViewImplementation.isActive();
  }

  _bindToStreamEvents() {
    const stream = get(
      membersMap,
      this
    ).contentPanelViewImplementation.getEventStream();
    stream.onValue(({ eventName }) => {
      this.emit(eventName);
    });
    stream.onEnd(() => {
      this.destroyed = true;
      this.emit('destroy');
    });
  }
}
