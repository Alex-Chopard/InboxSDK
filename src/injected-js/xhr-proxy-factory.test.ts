import assert from 'assert';
import _ from 'lodash';
import noop from 'lodash/noop';
import sinon from 'sinon';
import delay from 'pdelay';
import MockServer from '../../test/lib/MockServer';
const testError = new Error('TEST');
let logErrorTestCalls = 0;

function logError(error, label) {
  if (error === testError) {
    logErrorTestCalls++;
  } else {
    console.error('logError:', label, error);
    throw error || new Error(label);
  }
}

function thrower(err) {
  return function () {
    if (typeof err == 'string') {
      throw new Error(err);
    } else if (err) {
      throw err;
    } else {
      throw new Error('Should not happen');
    }
  };
}

import XHRProxyFactory from './xhr-proxy-factory';
const server = new MockServer();
server.respondWith(
  {
    method: 'GET',
    path: '/foo',
    headers: {
      'X-Special': 'Value',
    },
  },
  {
    status: 200,
    response: 'header value received',
  }
);
server.respondWith(
  {
    method: 'GET',
    path: '/foo',
    responseType: 'testing',
  },
  {
    status: 200,
    response: 'testing here!',
  }
);
server.respondWith(
  {
    method: 'GET',
    path: '/foo',
  },
  {
    status: 200,
    response: 'Response here!',
    partialResponse: 'Response here',
    headers: {
      'X-Test': 'Header Value',
    },
  }
);
server.respondWith(
  {
    method: 'POST',
    path: '/foo',
    body: 'somedata',
  },
  {
    status: 200,
    response: 'body received',
  }
);
server.respondWith(
  {
    method: 'POST',
    path: '/foo',
    body: 'testab',
  },
  {
    status: 200,
    response: 'testab received',
  }
);
server.respondWith(
  {
    method: 'POST',
    path: '/foo',
  },
  {
    status: 200,
    response: 'POST request',
  }
);
server.respondWith(
  {
    method: 'GET',
    path: '/foo2',
  },
  {
    status: 200,
    response: 'foo2 response!',
    partialResponse: 'foo2 response',
  }
);
server.respondWith(
  {
    method: 'GET',
    path: '/fooXml',
  },
  {
    status: 200,
    response: 'testing here!',
    responseXML: {
      fakeXml: true,
    },
  }
);
server.respondWith(
  {
    method: 'GETab',
    path: '/fooAB',
  },
  {
    status: 200,
    response: 'fooAB requested, data12 received',
  }
);
const XMLHttpRequest = server.XMLHttpRequest;
const constructors: Record<string, typeof XMLHttpRequest> = {
  XMLHttpRequest: XMLHttpRequest,
  XHRProxy: XHRProxyFactory(XMLHttpRequest, [], {
    logError: logError,
  }),
};
constructors['XHRProxy²'] = XHRProxyFactory(constructors.XHRProxy, [], {
  logError: logError,
});
constructors['XHRProxy with changers'] = XHRProxyFactory(
  XMLHttpRequest,
  [
    {
      isRelevantTo: () => true,

      requestChanger(connection, request) {
        return Promise.resolve(request);
      },

      responseTextChanger(connection, response) {
        return Promise.resolve(response);
      },
    },
  ],
  {
    logError: logError,
  }
);
beforeEach(() => {
  logErrorTestCalls = 0;
});
// Test both the mock and the instrumented version
['XMLHttpRequest', 'XHRProxy', 'XHRProxy²', 'XHRProxy with changers'].forEach(
  (XHRName) => {
    describe(XHRName, () => {
      let XHRConstructor: typeof XMLHttpRequest;
      let xhr: XMLHttpRequest;
      beforeEach(() => {
        XHRConstructor = constructors[XHRName];
        xhr = new XHRConstructor();
      });
      ['onreadystatechange', 'addEventListener'].forEach((method) => {
        describe(method, () => {
          it('should call all states and work on re-used object', (done) => {
            const calledForState = {
              '1': 0,
              '2': 0,
              '3': 0,
              '4': 0,
            };
            let runCount = 0;

            const listener = function (event: Record<string, any>) {
              assert.strictEqual(this, xhr, 'check for correct this binding');
              assert.strictEqual(
                event.target,
                this,
                'check for correct event target'
              );
              calledForState[this.readyState]++;

              if (this.readyState >= 2) {
                assert.equal(this.status, 200, 'check http status');
              }

              if (this.readyState >= 3) {
                assert.equal(
                  this.responseText,
                  this.response,
                  'check responseText'
                );
              } else {
                let responseText;

                try {
                  responseText = this.responseText;
                } catch (e) {
                  responseText = '';
                }

                assert.strictEqual(responseText, '');
              }

              if (this.readyState == 3) {
                if (XHRName === 'XHRProxy with changers') {
                  // No progress text should be given when a responseTextChanger is in use.
                  assert.strictEqual(this.response, '');
                } else {
                  assert.strictEqual(this.response, 'Response here');
                }
              }

              if (this.readyState == 4) {
                runCount++;
                assert.equal(this.response, 'Response here!');
                assert.deepEqual(
                  calledForState,
                  {
                    '1': runCount,
                    '2': runCount,
                    '3': runCount,
                    '4': runCount,
                  },
                  'check that listener was called for each state'
                );

                if (runCount === 1) {
                  start();
                } else {
                  done();
                }
              }
            };

            if (method == 'onreadystatechange') {
              xhr.onreadystatechange = listener;
            } else if (method == 'addEventListener') {
              xhr.addEventListener('readystatechange', listener);
            }

            function start() {
              xhr.open('GET', '/foo');
              assert.equal(xhr.readyState, 1, 'readyState check');
              xhr.send();
            }

            assert.equal(xhr.readyState, 0, 'readyState check');
            start();
          });
        });
      });
      describe('multiple event listeners', () => {
        it('should fire both together', (done) => {
          let simpleFired = false,
            addedFired = false;

          xhr.onreadystatechange = function (event) {
            simpleFired = true;
          };

          xhr.addEventListener(
            'readystatechange',
            function (event: Record<string, any>) {
              addedFired = true;
            }
          );
          xhr.addEventListener(
            'readystatechange',
            function (event: Record<string, any>) {
              if (this.readyState == 4) {
                assert(
                  simpleFired && addedFired,
                  'check that both listeners fired'
                );
                done();
              }
            }
          );
          xhr.open('GET', '/foo');
          xhr.send();
        });
      });
      describe('removeEventListener', () => {
        it('should work', (done) => {
          const badListener = function (event: Record<string, any>) {
            throw new Error('this listener should have been removed');
          };

          xhr.addEventListener('readystatechange', badListener);
          xhr.addEventListener(
            'readystatechange',
            function (event: Record<string, any>) {
              if (this.readyState == 4) {
                done();
              }
            }
          );
          xhr.removeEventListener('readystatechange', badListener);
          xhr.open('GET', '/foo');
          xhr.send();
        });
      });
      describe('abort', () => {
        it('should work after send', (done) => {
          let finishCount = 0;

          xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
              if (finishCount++ === 0) {
                assert.equal(
                  this.responseText,
                  'Response here',
                  'response check'
                );
                xhr.open('GET', '/foo2');
                xhr.send();
              } else {
                assert.equal(
                  this.responseText,
                  'foo2 response!',
                  'response check'
                );
                done();
              }
            }
          };

          xhr.open('GET', '/foo');
          xhr.send();
          xhr.abort();
        });
      });
      describe('open', () => {
        it('should cancel active request but without abort event', (done) => {
          xhr.onreadystatechange = sinon.spy();
          xhr.onabort = xhr.onerror = xhr.onload = xhr.onloadend = thrower();
          xhr.open('GET', '/foo');
          assert.strictEqual(xhr.readyState, 1);
          assert(xhr.onreadystatechange.calledOnce);
          xhr.onreadystatechange = thrower(
            'readyStateChange should not happen here'
          );
          xhr.send();
          xhr.open('GET', '/foo2');
          xhr.send();
          const stateCounts = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
          };

          xhr.onreadystatechange = function () {
            stateCounts[xhr.readyState]++;
          };

          xhr.onload = function () {
            assert.deepEqual(stateCounts, {
              '1': 0,
              '2': 1,
              '3': 1,
              '4': 1,
            });
            assert.strictEqual(xhr.responseText, 'foo2 response!');
            done();
          };

          xhr.onloadend = noop;
        });
      });
      describe('sync', () => {
        it('can do synchronous requests', () => {
          const onloadSpy = sinon.spy();

          xhr.onload = function () {
            assert.strictEqual(this, xhr, 'this check');
            onloadSpy();
          };

          xhr.open('GET', '/foo', false);
          xhr.send();
          assert.equal(xhr.readyState, 4, 'readyState check');
          assert.equal(xhr.responseText, 'Response here!', 'response check');
          assert(onloadSpy.calledOnce, 'check onload was ran');
        });
        it('async arg as undefined counts as false', () => {
          const onloadSpy = sinon.spy();

          xhr.onload = function () {
            assert.strictEqual(this, xhr, 'this check');
            onloadSpy();
          };

          xhr.open('GET', '/foo', undefined);
          xhr.send();
          assert.equal(xhr.readyState, 4, 'readyState check');
          assert.equal(xhr.responseText, 'Response here!', 'response check');
          assert(onloadSpy.calledOnce, 'check onload was ran');
        });
      });
      describe('events', () => {
        it('readystatechange', (done) => {
          const step = _.after(2, done);

          function checkEvent(event: Event) {
            assert.strictEqual(event.target, xhr);
            step();
          }

          xhr.onreadystatechange = function (event) {
            if (this.readyState == 4) {
              step();
            }
          };

          xhr.addEventListener(
            'readystatechange',
            function (event: Record<string, any>) {
              if (this.readyState == 4) {
                step();
              }
            }
          );
          xhr.open('GET', '/foo');
          xhr.send();
        });
        it('load', (done) => {
          const step = _.after(2, done);

          function checkEvent(event: Record<string, any>) {
            assert.strictEqual(event.target, xhr);
            assert.strictEqual(typeof event.lengthComputable, 'boolean');
            assert.strictEqual(typeof event.loaded, 'number');
            assert.strictEqual(typeof event.total, 'number');
            step();
          }

          xhr.onload = checkEvent;
          xhr.addEventListener('load', checkEvent);
          xhr.onerror = thrower();
          xhr.open('GET', '/foo');
          xhr.send();
        });
        it('loadstart', (done) => {
          const step = _.after(2, done);

          function checkEvent(event: Record<string, any>) {
            assert.strictEqual(event.target, xhr);
            assert.strictEqual(event.lengthComputable, false);
            assert.strictEqual(typeof event.loaded, 'number');
            assert.strictEqual(typeof event.total, 'number');
            step();
          }

          xhr.onloadstart = checkEvent;
          xhr.addEventListener('loadstart', checkEvent);
          xhr.open('GET', '/foo');
          xhr.send();
          xhr.abort();
        });
        it('loadend', (done) => {
          const step = _.after(4, done);

          function checkEvent(event: Record<string, any>) {
            assert.strictEqual(event.target, xhr);
            assert.strictEqual(typeof event.lengthComputable, 'boolean');
            assert.strictEqual(typeof event.loaded, 'number');
            assert.strictEqual(typeof event.total, 'number');
            step();
          }

          xhr.onload = checkEvent;
          xhr.addEventListener('load', checkEvent);
          xhr.onloadend = checkEvent;
          xhr.addEventListener('loadend', checkEvent);
          xhr.open('GET', '/foo');
          xhr.send();
        });
        it('error', (done) => {
          const step = _.after(4, done);

          function checkEvent(event: Record<string, any>) {
            assert.strictEqual(event.target, xhr);
            assert.strictEqual(typeof event.lengthComputable, 'boolean');
            assert.strictEqual(typeof event.loaded, 'number');
            assert.strictEqual(typeof event.total, 'number');
            step();
          }

          xhr.onload = thrower();
          xhr.onloadend = step.bind(null, null);
          xhr.addEventListener('loadend', step.bind(null, null));
          xhr.onerror = checkEvent;
          xhr.addEventListener('error', checkEvent);
          xhr.open('GET', '/non-existent-page');
          xhr.send();
        });
        it('abort', (done) => {
          const step = _.after(2, done);

          function checkEvent(event: Record<string, any>) {
            assert.strictEqual(event.target, xhr);
            assert.strictEqual(typeof event.lengthComputable, 'boolean');
            assert.strictEqual(typeof event.loaded, 'number');
            assert.strictEqual(typeof event.total, 'number');
            step();
          }

          xhr.onabort = checkEvent;
          xhr.addEventListener('abort', checkEvent);
          xhr.open('GET', '/foo');
          xhr.send();
          xhr.abort();
        });
      });
      describe('post', () => {
        it('works', (done) => {
          xhr.open('POST', '/foo');

          xhr.onload = function () {
            assert.strictEqual(xhr.responseText, 'body received');
            done();
          };

          xhr.send('somedata');
        });
        it('works without body', (done) => {
          xhr.open('POST', '/foo');

          xhr.onload = function () {
            assert.strictEqual(xhr.responseText, 'POST request');
            done();
          };

          xhr.send();
        });
      });
      describe('properties', () => {
        it('has the necessary constants', () => {
          assert.strictEqual((XHRConstructor as any).UNSENT, 0);
          assert.strictEqual((XHRConstructor as any).OPENED, 1);
          assert.strictEqual((XHRConstructor as any).HEADERS_RECEIVED, 2);
          assert.strictEqual((XHRConstructor as any).LOADING, 3);
          assert.strictEqual((XHRConstructor as any).DONE, 4);
          assert.strictEqual((xhr as any).UNSENT, 0);
          assert.strictEqual((xhr as any).OPENED, 1);
          assert.strictEqual((xhr as any).HEADERS_RECEIVED, 2);
          assert.strictEqual((xhr as any).LOADING, 3);
          assert.strictEqual((xhr as any).DONE, 4);
        });
      });
      describe('responseType', () => {
        it('supports non-text values', (done) => {
          xhr.responseType = 'testing';

          xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
              assert.equal(xhr.response, 'testing here!');
              let rt = '';

              try {
                rt = xhr.responseText;
              } catch (e) {
                // ignore
              }

              assert.strictEqual(rt, '', 'responseText check');
              done();
            }
          };

          xhr.open('GET', '/foo');
          xhr.send();
        });
        it('supports responseXml', (done) => {
          xhr.onload = function () {
            assert.equal(xhr.responseText, 'testing here!');
            assert.deepEqual(xhr.responseXML, {
              fakeXml: true,
            });
            done();
          };

          xhr.open('GET', '/fooXml');
          xhr.send();
        });
      });
      describe('getResponseHeader', () => {
        it('should work', (done) => {
          xhr.onreadystatechange = function () {
            if (this.readyState < 2) {
              assert.strictEqual(xhr.getResponseHeader('X-Test'), null);
            } else {
              assert.equal(this.getResponseHeader('X-Test'), 'Header Value');
            }

            if (this.readyState == 4) {
              done();
            }
          };

          assert.strictEqual(xhr.getResponseHeader('X-Test'), null);
          xhr.open('GET', '/foo');
          assert.strictEqual(xhr.getResponseHeader('X-Test'), null);
          xhr.send();
          assert.strictEqual(xhr.getResponseHeader('X-Test'), null);
        });
      });
      describe('getAllResponseHeaders', () => {
        it('should work', (done) => {
          xhr.onreadystatechange = function () {
            if (this.readyState < 2) {
              assert.strictEqual(xhr.getAllResponseHeaders(), null);
            } else {
              assert.equal(
                this.getAllResponseHeaders().trim().toLowerCase(),
                'x-test: header value'
              );
            }

            if (this.readyState == 4) {
              done();
            }
          };

          assert.strictEqual(xhr.getAllResponseHeaders(), null);
          xhr.open('GET', '/foo');
          assert.strictEqual(xhr.getAllResponseHeaders(), null);
          xhr.send();
          assert.strictEqual(xhr.getAllResponseHeaders(), null);
        });
      });
      describe('setRequestHeader', () => {
        it('should work', (done) => {
          xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
              assert.equal(this.response, 'header value received');
              done();
            }
          };

          xhr.open('GET', '/foo');
          xhr.setRequestHeader('X-Special', 'Value');
          xhr.send();
        });
      });
      describe('prototype', () => {
        it('should be present', () => {
          assert('prototype' in XHRConstructor);
          assert(typeof XHRConstructor.prototype.open === 'function');
          assert(typeof XHRConstructor.prototype.send === 'function');
        });
      });
      describe('MailTrack compatibility', () => {
        // MailTrack redefines js_frame's XMLHttpRequest.prototype.open to do
        // some stuff, and then looks up the main frame's
        // XMLHttpRequest.prototype.open and calls it.
        // This can result in XHRProxy.prototype.open being called with `this`
        // set to a real XMLHttpRequest object.
        it('works with MailTrack', (done) => {
          const realXhr = new XMLHttpRequest();

          realXhr.onload = () => done();

          XHRConstructor.prototype.open.call(realXhr, 'GET', '/foo');
          realXhr.send();
        });
      });
    });
  }
);
describe('XHRProxyFactory', () => {
  describe('wrappers', () => {
    it('should be used with responseTextChanger present and work on re-used object', (done) => {
      let origResponse;
      let originalSendBodyLoggerRan = 0;
      let originalResponseTextLoggerRan = 0;
      let responseTextChangerRan = 0;
      let finalResponseTextLoggerRan = 0;
      let firstAfterListenersRan = 0;
      let rsc4Ran = 0;
      let runCount = 0;

      function checkConnectionParam(
        connection,
        expectStatus,
        expectOriginalSendBody
      ) {
        assert.equal(
          (connection as any)._flag,
          true,
          'connection object check'
        );

        if (expectStatus) {
          assert.equal((connection as any).status, 200, 'status check');
          assert.equal(
            (connection as any).responseType,
            'text',
            'responseType check'
          );
        }

        assert.equal(
          connection.originalSendBody,
          expectOriginalSendBody ? 'body test' : undefined,
          'body check'
        );
        assert.equal(connection.method, 'GET', 'method check');
        assert.equal(connection.url, '/foo', 'url check');
        assert.deepEqual(connection.params, {}, 'params check');
      }

      const wrappers = [
        {
          isRelevantTo(connection) {
            assert.strictEqual(this, wrappers[0], 'this check');
            assert(
              !(connection as any)._flag,
              'check that connection object is fresh'
            );
            (connection as any)._flag = true;
            checkConnectionParam(connection, false, false);
            return connection.url == '/foo';
          },

          originalSendBodyLogger(connection, body) {
            assert.strictEqual(this, wrappers[0], 'this check');
            checkConnectionParam(connection, false, true);
            assert.equal(body, 'body test', 'body check');
            originalSendBodyLoggerRan++;
          },

          originalResponseTextLogger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            checkConnectionParam(connection, true, true);
            originalResponseTextLoggerRan++;
            origResponse = response;
          },

          responseTextChanger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            checkConnectionParam(connection, true, true);
            responseTextChangerRan++;
            assert.equal(response, origResponse);
            return response + '-modified' + runCount;
          },

          finalResponseTextLogger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            checkConnectionParam(connection, true, true);
            finalResponseTextLoggerRan++;
            assert.equal(response, origResponse + '-modified' + runCount);
          },

          afterListeners(connection) {
            firstAfterListenersRan++;
          },
        },
        {
          isRelevantTo(connection) {
            return true;
          },

          originalSendBodyLogger(connection, body) {
            originalSendBodyLoggerRan++;
          },

          originalResponseTextLogger(connection, response) {
            originalResponseTextLoggerRan++;
            assert.equal(response, origResponse);
          },

          finalResponseTextLogger(connection, response) {
            finalResponseTextLoggerRan++;
            assert.equal(response, origResponse + '-modified' + runCount);
          },

          afterListeners(connection) {
            assert.equal(
              firstAfterListenersRan,
              1 * runCount,
              'check that afterListeners ran correct number of times'
            );
            assert.equal(
              rsc4Ran,
              1 * runCount,
              'check that readystatechange listener ran correct number of times'
            );

            if (runCount === 1) {
              start();
            } else {
              done();
            }
          },
        },
        {
          isRelevantTo(connection) {
            return false;
          },

          originalSendBodyLogger(connection, body) {
            throw new Error('should not run');
          },

          originalResponseTextLogger(connection, response) {
            throw new Error('should not run');
          },

          responseTextChanger(connection, response) {
            throw new Error('should not run');
          },

          finalResponseTextLogger(connection, response) {
            throw new Error('should not run');
          },

          afterListeners(connection) {
            throw new Error('should not run');
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();

      xhr.onreadystatechange = function () {
        if (this.readyState == 3) {
          assert.equal(
            this.response,
            '',
            'check response is empty until end when responseTextChanger is used'
          );
          assert.equal(this.responseText, this.response, 'check responseText');
        }

        if (this.readyState == 4) {
          runCount++;
          assert.equal(
            originalSendBodyLoggerRan,
            2 * runCount,
            'check that originalSendBodyLogger ran correct number of times'
          );
          assert.equal(
            originalResponseTextLoggerRan,
            2 * runCount,
            'check that originalResponseTextLogger ran correct number of times'
          );
          assert.equal(
            responseTextChangerRan,
            1 * runCount,
            'check that responseTextChanger ran correct number of times'
          );
          assert.equal(
            finalResponseTextLoggerRan,
            2 * runCount,
            'check that finalResponseTextLogger ran correct number of times'
          );
          assert.equal(
            firstAfterListenersRan,
            1 * (runCount - 1),
            'check that afterListeners ran correct number of times'
          );
          assert.equal(
            this.response,
            origResponse + '-modified' + (runCount - 1),
            'check that response was modified'
          );
          assert.equal(this.responseText, this.response, 'check responseText');
          rsc4Ran++; // done is in afterListener wrapper
        }
      };

      function start() {
        xhr.open('GET', '/foo');
        xhr.send('body test');
      }

      start();
    });
    it('should be used without responseTextChanger present', (done) => {
      let origResponse;
      let originalResponseTextLoggerRan = 0;
      let finalResponseTextLoggerRan = 0;
      const wrappers = [
        {
          isRelevantTo(connection) {
            return true;
          },

          originalResponseTextLogger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            originalResponseTextLoggerRan++;
            origResponse = response;
          },

          finalResponseTextLogger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            finalResponseTextLoggerRan++;
            assert.equal(response, origResponse);
          },
        },
        {
          isRelevantTo(connection) {
            return false;
          },

          responseTextChanger(connection, response) {
            throw new Error('should not run');
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();

      xhr.onreadystatechange = function () {
        assert.equal(this.responseText, this.response, 'check responseText');

        if (this.readyState == 3) {
          assert.equal(this.response, 'Response here', 'check response');
        }

        if (this.readyState == 4) {
          assert.equal(this.response, 'Response here!', 'check response');
          assert.equal(
            originalResponseTextLoggerRan,
            1,
            'check that originalResponseTextLogger ran correct number of times'
          );
          assert.equal(
            finalResponseTextLoggerRan,
            1,
            'check that finalResponseTextLogger ran correct number of times'
          );
          done();
        }
      };

      xhr.open('GET', '/foo');
      xhr.send();
    });
    it('should not have errors prevent event listeners', (done) => {
      let loggerRan = 0;
      const wrappers = [
        {
          isRelevantTo(connection) {
            throw testError;
          },

          originalResponseTextLogger(connection, response) {
            throw new Error('should not run');
          },
        },
        {
          isRelevantTo(connection) {
            return true;
          },

          originalSendBodyLogger(connection, body) {
            throw testError;
          },

          requestChanger(connection, body) {
            throw testError;
          },

          originalResponseTextLogger(connection, response) {
            loggerRan++;
            throw testError;
          },

          responseTextChanger(connection, response) {
            throw testError;
          },

          finalResponseTextLogger(connection, response) {
            throw testError;
          },
        },
        {
          isRelevantTo(connection) {
            return true;
          },

          originalSendBodyLogger(connection, body) {
            throw testError;
          },

          originalResponseTextLogger(connection, response) {
            throw testError;
          },

          finalResponseTextLogger(connection, response) {
            throw testError;
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();

      xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
          assert.equal(
            logErrorTestCalls,
            9,
            'check that logError was called correct number of times'
          );
          assert.equal(
            loggerRan,
            1,
            'check that originalResponseTextLogger was attempted'
          );
          assert.equal(this.response, 'Response here!', 'check response');
          done();
        }
      };

      xhr.open('GET', '/foo');
      xhr.send();
    });
    it('can have wrappers changed after construction', (done) => {
      const wrappers = [
        {
          isRelevantTo(connection) {
            throw new Error('should not run');
          },

          originalResponseTextLogger(connection, response) {
            throw new Error('should not run');
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      let loggerRan = 0;
      wrappers.length = 0;
      wrappers.push({
        isRelevantTo(connection) {
          return true;
        },

        originalResponseTextLogger(connection, response) {
          loggerRan++;
        },
      });
      const xhr = new XHRProxy();

      xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
          assert.equal(
            loggerRan,
            1,
            'check that originalResponseTextLogger has run'
          );
          done();
        }
      };

      xhr.open('GET', '/foo');
      xhr.send();
    });
    it('should support promises for responseTextChanger', (done) => {
      let origResponse;
      let responseTextChangerRan = 0;
      let finalResponseTextLoggerRan = 0;

      function checkConnectionParam(connection) {
        assert.equal(
          (connection as any)._flag,
          true,
          'connection object check'
        );
      }

      const wrappers = [
        {
          isRelevantTo(connection) {
            assert.strictEqual(this, wrappers[0], 'this check');
            (connection as any)._flag = true;
            checkConnectionParam(connection);
            return connection.url == '/foo';
          },

          originalResponseTextLogger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            checkConnectionParam(connection);
            origResponse = response;
          },

          async responseTextChanger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            await delay(1);
            checkConnectionParam(connection);
            responseTextChangerRan++;
            assert.equal(response, origResponse);
            assert.equal(
              xhr.readyState,
              3,
              'check that readyState is still LOADING'
            );
            return response + '-modified';
          },

          finalResponseTextLogger(connection, response) {
            assert.strictEqual(this, wrappers[0], 'this check');
            checkConnectionParam(connection);
            finalResponseTextLoggerRan++;
            assert.equal(response, origResponse + '-modified');
          },
        },
        {
          isRelevantTo(connection) {
            return true;
          },

          finalResponseTextLogger(connection, response) {
            finalResponseTextLoggerRan++;
            assert.equal(response, origResponse + '-modified');
          },
        },
        {
          isRelevantTo(connection) {
            return false;
          },

          requestChanger() {
            throw new Error('should not run');
          },

          responseTextChanger(connection, response) {
            throw new Error('should not run');
          },

          finalResponseTextLogger(connection, response) {
            throw new Error('should not run');
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();
      let methodCalled = false,
        addedListenerCalled = false;

      const finishRsc = _.after(2, () => {
        assert(methodCalled, 'check that onreadystatechange method was called');
        assert(addedListenerCalled, 'check that added listener was called');
        assert.equal(
          responseTextChangerRan,
          1,
          'check that responseTextChanger ran correct number of times'
        );
        assert.equal(
          finalResponseTextLoggerRan,
          2,
          'check that finalResponseTextLogger ran correct number of times'
        );
        done();
      });

      xhr.onreadystatechange = function () {
        assert.equal(this.responseText, this.response, 'check responseText');

        if (this.readyState == 4) {
          assert.equal(
            this.response,
            origResponse + '-modified',
            'check that response was modified'
          );
          methodCalled = true;
          finishRsc();
        }
      };

      xhr.addEventListener('readystatechange', function () {
        if (this.readyState == 4) {
          assert.equal(
            this.response,
            origResponse + '-modified',
            'check that response was modified'
          );
          addedListenerCalled = true;
          finishRsc();
        }
      });
      xhr.open('GET', '/foo');
      xhr.send();
    });
    it('should have responseTextChanger promises respect abort', (done) => {
      const wrappers = [
        {
          isRelevantTo(connection) {
            return connection.url == '/foo';
          },

          async responseTextChanger(connection, response) {
            // start a new request, aborting the current one, so that the result
            // of this responseTextChanger never gets seen.
            xhr.open('GET', '/foo2');
            xhr.send();
            await delay(1);
            return response + '-modified';
          },

          finalResponseTextLogger(connection, response) {
            throw new Error('should not run');
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();
      xhr.addEventListener('readystatechange', function () {
        if (this.readyState == 4) {
          assert.equal(this.responseText, 'foo2 response!');
          done();
        }
      });
      xhr.open('GET', '/foo');
      xhr.send();
    });
    it('supports multiple responseTextChanger wrappers', (done) => {
      const wrappers = [
        {
          isRelevantTo: () => true,

          responseTextChanger(connection, response) {
            assert.strictEqual(
              connection.originalResponseText,
              'foo2 response!'
            );
            assert.strictEqual(
              connection.modifiedResponseText,
              'foo2 response!'
            );
            assert.strictEqual(connection.modifiedResponseText, response);
            return response + 'a';
          },
        },
        {
          isRelevantTo: () => true,

          responseTextChanger(connection, response) {
            assert.strictEqual(
              connection.originalResponseText,
              'foo2 response!'
            );
            assert.strictEqual(
              connection.modifiedResponseText,
              'foo2 response!a'
            );
            assert.strictEqual(connection.modifiedResponseText, response);
            return response + 'b';
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();

      xhr.onload = function () {
        assert.strictEqual(this.responseText, 'foo2 response!ab');
        done();
      };

      xhr.open('GET', '/foo2');
      xhr.send();
    });
    it('should ignore invalid responseTextChanger return value', (done) => {
      const logErrorSpy = sinon.spy();
      const wrappers = [
        {
          isRelevantTo: () => true,

          responseTextChanger(connection, response) {
            return null as any;
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logErrorSpy,
      });
      const xhr = new XHRProxy();

      xhr.onload = function () {
        assert.strictEqual(this.responseText, 'foo2 response!');
        assert(logErrorSpy.calledOnce);
        done();
      };

      xhr.open('GET', '/foo2');
      xhr.send();
    });
    it('requestChanger should work', (done) => {
      const wrappers = [
        {
          isRelevantTo: () => true,

          requestChanger(connection, request) {
            return Promise.resolve({
              method: request.method + 'a',
              url: request.url + 'A',
              body: request.body + '1',
            });
          },
        },
        {
          isRelevantTo: () => true,

          requestChanger(connection, request) {
            return {
              method: request.method + 'b',
              url: request.url + 'B',
              body: request.body + '2',
            };
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logError,
      });
      const xhr = new XHRProxy();

      xhr.onload = function () {
        assert.strictEqual(
          this.responseText,
          'fooAB requested, data12 received'
        );
        done();
      };

      xhr.onerror = done;
      xhr.open('GET', '/foo');
      xhr.send('data');
    });
    it('requestChanger should check returned value for sanity', (done) => {
      const logErrorSpy = sinon.spy();
      const wrappers = [
        {
          isRelevantTo: () => true,

          requestChanger(connection, request): any {
            return Promise.resolve({
              method: request.method + 'a',
              url: request.url + 'A',
              _MISSPELL_body: request.body + '1',
            });
          },
        },
      ];
      const XHRProxy = XHRProxyFactory(XMLHttpRequest, wrappers, {
        logError: logErrorSpy,
      });
      const xhr = new XHRProxy();

      xhr.onload = function () {
        assert.strictEqual(this.responseText, 'body received');
        assert(logErrorSpy.calledOnce);
        done();
      };

      xhr.onerror = thrower('xhr error');
      xhr.open('POST', '/foo');
      xhr.send('somedata');
    });
  });
});
