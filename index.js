'use strict'

const flattenBrunchMap = require('flatten-brunch-map')
const genPugSourceMap = require('gen-pug-source-map')
const sysPath = require('path')
const pug = require('pug')

// used pug options, note this list does not include 'name'
const PUGPROPS = [
  'filename', 'basedir', 'doctype', 'pretty', 'filters', 'self',
  'debug', 'compileDebug', 'globals', 'cache', 'inlineRuntimeFunctions'
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
        staticPretty: true,
        inlineRuntimeFunctions: false,
        compileDebug: !brunchConf.optimize,
        sourceMap: !!brunchConf.sourceMaps
      },
      brunchConf.plugins && brunchConf.plugins.pug
    )

    // Maybe solves #4 (issues with auto-reload)
    if (!config.staticOutdir) {
      config.staticOutdir = config.staticBasedir
    }

    // v2.8.7 add default globals to the user defined set
    const globals = ['require', 'String', 'Number', 'Boolean', 'Date', 'Array', 'Function', 'Math', 'RegExp', 'Promise']

    if (config.globals) {
      config.globals.forEach(g => { if (globals.indexOf(g) < 0) globals.push(g) })
    }
    config.globals = globals

    this.config = config

    // Brunch looks for `pattern` in `this`
    if (config.pattern) {
      this.pattern = config.pattern
    }

    // The runtime can be excluded by setting pugRuntime:false
    if ('noRuntime' in config) {
      // eslint-disable-next-line no-console
      console.error('pugjs-brunch: `noRuntime` is DEPRECATED, please use `pugRuntime:false`')
      if (config.noRuntime) config.pugRuntime = false
    }

    if (config.preCompile && !config.preCompilePattern || config.inlineRuntimeFunctions) {
      config.pugRuntime = false
    }

    // Dependencies cache, auto-reload still not working in brunch v2.10.10
    this._depcache = []
  }

  get include () {
    let runtime = this.config.pugRuntime

    if (runtime !== false && !(runtime && typeof runtime == 'string')) {
      //
      // Ok this is not pretty, but seems to work with brunch 2.9.x and 2.10.x
      // node returns the real path of sym-linked modules so brunch can wrap
      // the runtime. path.resolve() works as expected under Linux in regular
      // conditions (hope in Windows as well).
      //
      let base = __dirname
      if (base.indexOf('node_modules') < 0) {   // can be a symlink
        base = sysPath.resolve('node_modules', sysPath.basename(base))
      }
      runtime = sysPath.resolve(base, 'vendor', 'pug_runtime.js')
    }
    return runtime ? [runtime] : []
  }

  getDependencies (data, path, cb) {
    const deps = path in this._depcache && this._depcache[path] || []
    return cb(null, deps)
  }

  compile (params) {
    const data = params.data
    const path = params.path

    if (this.config.preCompile &&
      (!this.config.preCompilePattern || this.config.preCompilePattern.test(path))
     ) {
      return this._precompile(
        data,
        path,
        this.config
      )
    }

    return new Promise((resolve, reject) => {

      // cloning options is mandatory because Pug changes it
      const options = cloneProps(this.config, PUGPROPS)
      options.filename = path

      try {
        const dbg = options.compileDebug
        if (this.config.sourceMap) options.compileDebug = true

        const res = pug.compileClientWithDependenciesTracked(data, options)
        this._setDeps(path, res)

        let result = this._export(path, res.body)

        if (this.config.sourceMap) {
          const duple = genPugSourceMap(path, result, {
            basedir: options.basedir,
            keepDebugLines: dbg
          })
          result = flattenBrunchMap(params, duple.data, duple.map)
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
      true
    )
  }

  _precompile (data, path, config, asset) {
    const locals  = dup(config.locals)
    const options = cloneProps(config, PUGPROPS)

    // by no inlining functions, pug uses own `require('pug-runtime')`
    options.inlineRuntimeFunctions = false

    // set options.filename to the filename, but relative to Brunch root
    options.filename = path

    // now set the staticBasedir only for assets (static html files)
    if (asset) {
      options.basedir = config.staticBasedir
      options.pretty  = 'staticPretty' in config ? config.staticPretty : config.pretty
    }

    return new Promise((resolve, reject) => {
      try {
        const fn = pug.compile(data, options)
        let html = fn(locals)

        if (!asset) {
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
    if (src && src.length) {
      const deps = []
      src.forEach(dep => { if (deps.indexOf(dep) < 0) deps.push(dep) })
      this._depcache[path] = deps
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
