/* eslint-disable flowtype/require-valid-file-annotation */

const { injectScriptEmbedded } = require('./lib/inject-script-EMBEDDED');
require('./lib/inject-script').setInjectScriptImplementation(
  injectScriptEmbedded
);

module.exports = require('./main');
