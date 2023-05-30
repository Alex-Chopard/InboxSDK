// Takes an input function, and returns {fn, revoke}.
// Before revoke is called, calling fn is equivalent to calling the input
// function.
// After revoke is called, calling fn is a no-op, and fn no longer holds a
// reference to inputFn.
// The revoke function does not hold a reference to inputFn or revokedFn ever.
// The optional second parameter revokedFn is a function to make fn call after
// it has been revoked.
import once from 'lodash/once';
import noop from 'lodash/noop';
export default function makeRevocableFunction<
  F extends (...args: Array<any>) => any
>(
  inputFn: F,
  revokedFn: (...args: Array<any>) => any = noop
): {
  fn: F;
  revoke: () => void;
} {
  let key = {};
  return {
    fn: (function () {
      if (!key) {
        throw new Error('Should not happen');
      }

      const _revokedFn = revokedFn;
      const wm = new WeakMap();
      wm.set(key, inputFn);
      inputFn = revokedFn = null as any;
      return function () {
        return ((key ? wm.get(key) : _revokedFn) as any).apply(this, arguments);
      } as any;
    })(),
    revoke: once(function () {
      key = null;
    }),
  };
}
