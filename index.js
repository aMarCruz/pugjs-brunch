'use strict'

const bundleMap = require('gen-pug-source-map')
const pug = require('pug')
const sysPath = require('path')

//const PRECOMP = /\.static\.(?:jade|pug)$/

// used pug options, note this list does not include 'name'
const PUGPROPS = [
  'filename', 'basedir', 'doctype', 'pretty', 'filters', 'self',
  'debug', 'compileDebug', 'globals', 'inlineRuntimeFunctions'
]

const dup = (src) => Object.assign({}, src)

// perform a deep cloning of an object
function clone (obj) {
  if (obj == null || typeof obj != 'object') return obj
  const copy = obj.constructor()
  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr])
  }
  return copy
}

function cloneProps (src, list) {
  return list.reduce((o, p) => {
    if (p in src) o[p] = clone(src[p])
    return o
  }, {})
}

/*
    THE PLUGIN
*/

class PugCompiler {

  constructor (brunchConf) {

    const defaultBasedir = sysPath.join(brunchConf.paths.root, 'app')

    // shallow copy the options passed by the user mixed with defaults
    const config = Object.assign(
      {
        doctype: 'html',
        basedir: defaultBasedir,
        staticBasedir: sysPath.join(defaultBasedir, 'assets'),
        inlineRuntimeFunctions: false,
        compileDebug: !brunchConf.optimize,
        globals: []
      },
      brunchConf.plugins && brunchConf.plugins.pug
    )

    this.config = config

    // we need compileDebug to generate source map
    if (!this.config.compileDebug) this.config.sourceMap = false

    //if (!this.config.preCompilePattern) this.config.preCompilePattern = PRECOMP
    if (config.staticPattern) this.staticPattern = config.staticPattern
    if (config.pattern) this.pattern = config.pattern

    // globals in defaults is an empty array, but user can overwrite this.
    if (config.globals) config.globals.push('require')

    // The runtime can be excluded by setting pugRuntime:false
    if ('noRuntime' in config) {
      // eslint-disable-next-line no-console
      console.error('pugjs-brunch: `noRuntime` is DEPRECATED, please use `pugRuntime:false`')
      if (config.noRuntime) config.pugRuntime = false
    }

    if (config.preCompile) {
      config.pugRuntime = false
      config.inlineRuntimeFunctions = false
    }
    if (config.pugRuntime !== false && !config.inlineRuntimeFunctions) {
      this._addRuntime(config.pugRuntime)
    }

    this._depcache = []
  }

  getDependencies (data, path, cb) {
    const deps = path in this._depcache && this._depcache[path] || []
    return cb(null, deps)
  }

  compile (params) {
    const data = params.data
    const path = params.path

    if (this.config.preCompile === true/* || this.config.preCompilePattern.test(path)*/) {
      return this._precompile(
        data,
        path,
        this.config
      )
    }

    // cloning options is mandatory because Pug changes it
    const options = cloneProps(this.config, PUGPROPS)
    options.filename = path

    return new Promise((resolve, reject) => {
      try {
        const res = pug.compileClientWithDependenciesTracked(data, options)
        this._setDeps(path, res)

        let result = this._export(path, res.body)

        if (this.config.sourceMap !== false) {
          result = bundleMap(path, data, result)
        }

        resolve(result)

      } catch (_error) {

        reject(_error)
      }
    })
  }

  compileStatic (params) {
    return this._precompile(
      params.data,
      params.path,
      this.config,
      this.config.staticBasedir
    )
  }

  _precompile (data, path, config, basedir) {
    const locals  = dup(config.locals)
    const options = cloneProps(config, PUGPROPS)

    // by no inlining functions, pug uses own `require('pug-runtime')`
    options.inlineRuntimeFunctions = false

    // set options.filename to the filename, but relative to basedir
    options.filename = path.indexOf(options.basedir) ? path
                     : path.slice(options.basedir.length + 1)

    // now we can set the staticBasedir
    if (basedir) options.basedir = basedir

    return new Promise((resolve, reject) => {
      try {
        const fn = pug.compile(data, options)
        let html = fn(locals)

        if (!basedir) {
          html = this._export(null, JSON.stringify(html))
        }
        this._setDeps(path, fn)

        resolve(html)

      } catch (error) {

        reject(error)
      }
    })
  }

  _setDeps (path, res) {
    const src = res.dependencies
    let deps = []
    if (src.length > 1) {
      deps = src.filter((dep) => deps.indexOf(dep) < 0 && !!deps.push(dep))
    }
    this._depcache[path] = deps
  }

  _addRuntime (path) {
    if (!path) {
      path = './runtime.js'
    } else if (path[0] === '.') {
      path = sysPath.resolve('.', path)
    }
    try {
      this.include = [require.resolve(path)]
    } catch (e) {
      throw e
    }
  }

  _export (path, tmpl) {
    return path === null ? `module.exports = ${tmpl};\n` : `${tmpl};\nmodule.exports = template;\n`
  }

}

PugCompiler.prototype.brunchPlugin = true
PugCompiler.prototype.type = 'template'
PugCompiler.prototype.pattern = /\.(?:pug|jade)$/
PugCompiler.prototype.staticTargetExtension = 'html'

module.exports = PugCompiler
