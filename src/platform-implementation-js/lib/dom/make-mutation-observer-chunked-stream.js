var asap = require('asap');
var Bacon = require('baconjs');

// Creates a mutation observer watching the given element and emits the events in a stream.
function makeMutationObserverChunkedStream(element, options) {
  return Bacon.fromBinder(function(sink) {
    var observer = new MutationObserver(function(mutations) {
      // Work around Safari bug where sometimes mutations is an instance of a
      // different context's Array.
      sink(mutations instanceof Array ? mutations : Array.from(mutations));
    });

    observer.observe(element, options);

    return function() {
      observer.disconnect();
    };
  });
}

module.exports = makeMutationObserverChunkedStream;
