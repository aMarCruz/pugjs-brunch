/// <reference path="./types.d.ts" />

const sysPath = require('path')

/**
 * @param {object} brunchConf
 * @returns {PugPluginOpts}
 */
module.exports = (brunchConf) => {

  const defaultBasedir = sysPath.join(brunchConf.paths.root, 'app')

  // shallow copy the options passed by the user mixed with defaults
  /** @type {PugPluginOpts} */
  const config = Object.assign(
    {
      doctype: 'html',
      basedir: defaultBasedir,
      staticBasedir: sysPath.join(defaultBasedir, 'assets'),
      staticPretty: !brunchConf.optimize,
      preCompilePattern: /\.html\.pug$/,
      inlineRuntimeFunctions: false,
      compileDebug: !brunchConf.optimize,
      sourceMap: brunchConf.sourceMaps !== false,
    },
    brunchConf.plugins && brunchConf.plugins.pug
  )

  if ('preCompile' in config) {
    throw new Error('[plugin-pug] The `preCompile` option was removed in this version, please see the README.')
  }
  if (typeof config.pugRuntime == 'string') {
    throw new Error('[plugin-pug] The `pugRuntime` option must be a boolean, please see the README.')
  }

  // The runtime can be excluded by setting pugRuntime:false
  if (config.inlineRuntimeFunctions || config.preCompilePattern.source === '\\S') {
    config.pugRuntime = false
  } else if (config.pugRuntime !== false) {
    config.pugRuntime = true
  }

  // v2.8.7 add default globals to the user defined set
  // v2.11.0 add Object & Symbol to globals
  const globals = [
    'require',
    'Array',
    'Boolean',
    'Date',
    'Function',
    'Math',
    'Number',
    'Object',
    'Promise',
    'RegExp',
    'String',
    'Symbol',
  ]

  if (config.globals) {
    config.globals.forEach((g) => {
      if (globals.indexOf(g) < 0) {
        globals.push(g)
      }
    })
  }

  config.globals = globals

  return config
}
