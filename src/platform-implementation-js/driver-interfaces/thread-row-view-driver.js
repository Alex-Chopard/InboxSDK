/* @flow */

export type ThreadRowViewDriver = {
  addLabel(label: Object): void,
  addButton(buttonDescriptor: Object): void,
  addAttachmentIcon(opts: Object): void,
  replaceDate(opts: Object): void,
  getSubject(): string,
  replaceSubject(newSubjectStr: string): void,
  getDateString(): string,
  getThreadID(): string,
};
