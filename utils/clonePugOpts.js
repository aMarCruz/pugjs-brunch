const deepClone = require('./deepClone')

// used pug options, note this list does not include 'name' nor `filename`
const PUGPROPS = [
  'basedir',
  'compileDebug',
  'debug',
  'doctype',
  'filters',
  'globals',
  'inlineRuntimeFunctions',
  'pretty',
  'self',
]

/**
 * @param {import('./typings').PugPluginOpts} src
 * @param {string} filename
 * @returns {import('./typings').PugOwnOpts}
 */
module.exports = (src, filename) => PUGPROPS.reduce((o, p) => {
  if (p in src) {
    o[p] = deepClone(src[p])
  }
  return o
}, { filename })
