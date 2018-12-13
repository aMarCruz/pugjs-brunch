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
    throw new Error(': The `preCompile` option of pugjs-brunch was removed, please use only `preCompilePattern`.')
  }
  if (typeof config.pugRuntime == 'string') {
    throw new Error(': The `pugRuntime` option of pugjs-brunch must be a boolean value.')
  }

  // The runtime can be excluded by setting pugRuntime:false
  if (config.inlineRuntimeFunctions || config.preCompilePattern.source === '\\S') {
    config.pugRuntime = false
  } else if (config.pugRuntime !== false) {
    config.pugRuntime = true
  }

  // v2.8.7 add default globals to the user defined set
  // v2.11.0 add Object & Symbol to globals
  // v2.12.0 add Map, Set, WeakMap, WeakSet to globals
  const globals = [
    'require',
    'Array',
    'Boolean',
    'Date',
    'Function',
    'Map',
    'Math',
    'Number',
    'Object',
    'Promise',
    'RegExp',
    'Set',
    'String',
    'Symbol',
    'WeakMap',
    'WeakSet',
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
