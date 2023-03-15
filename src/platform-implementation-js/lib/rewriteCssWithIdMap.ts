import idMap from './idMap';

export default function rewriteCssWithIdMap(cssSource: string): string {
  return cssSource.replace(
    /\.IDMAP_([-a-zA-Z0-9_]+)/g,
    (match, classname) => `.${idMap(classname)}`
  );
}
