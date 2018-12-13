/// <reference path="./utils/types.d.ts" />
'use strict'

const deepClone = require('@jsbits/deep-clone')
const flattenBrunchMap = require('flatten-brunch-map')
const genPugSourceMap = require('gen-pug-source-map')
const pug = require('pug')
const sysPath = require('path')

const clonePugOpts = require('./utils/clonePugOpts')
const parseOptions = require('./utils/parseOptions')

/*
  THE PLUGIN
*/

class PugCompiler {

  constructor (brunchConf) {

    // shallow copy the options passed by the user mixed with defaults
    const config = parseOptions(brunchConf)

    this.config = config

    // Dependencies cache, auto-reload still not working in brunch v2.10.10
    /** @type {{ [k:string]: string[] }} */
    this._depcache = {}
  }

  get include () {

    if (this.config.pugRuntime) {
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

      return [sysPath.resolve(base, 'vendor', 'pug_runtime.js')]
    }

    return []
  }

  getDependencies (data, path, cb) {
    return cb(null, this._depcache[path] || [])
  }

  /**
   * Dynamic compilation or html precompilation
   * @param {{data: string, path: string}} params - Brunch params
   */
  compile (params) {
    const { data, path } = params
    const config = this.config

    if (config.preCompilePattern && config.preCompilePattern.test(path)) {
      return this._precompile(data, path, config)
    }

    return new Promise((resolve, reject) => {

      // cloning options is mandatory because Pug changes it
      const options = clonePugOpts(config, path)

      try {
        const dbg = options.compileDebug
        if (config.sourceMap) {
          options.compileDebug = true
        }

        const res = pug.compileClientWithDependenciesTracked(data, options)
        this._setDeps(path, res)

        let result = this._export(path, res.body)

        if (this.config.sourceMap) {
          const bundle = genPugSourceMap(path, result, {
            basedir: options.basedir,
            keepDebugLines: dbg,
          })
          result = flattenBrunchMap(params, bundle.data, bundle.map)
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

  /**
   * Precompilation
   * @param {string} data Template code
   * @param {string} path Template path
   * @param {PugPluginOpts} config User config
   * @param {boolean} [asset] Is this an html file
   */
  _precompile (data, path, config, asset) {
    const locals  = deepClone(config.locals)
    const options = clonePugOpts(config, path)

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

  /**
   * Register dependencies of template
   * @param {string} path Main template
   * @param {Function & {dependencies?: string[]}} res Template dependencies
   */
  _setDeps (path, res) {
    const src = res.dependencies

    if (src && src.length) {
      /** @type {string[]} */
      const deps = []

      // map path -> dependencies
      src.forEach((dep) => {
        if (deps.indexOf(dep) < 0) {
          deps.push(dep)
        }
      })
      this._depcache[path] = deps

      // map dependencies -> path
      deps.forEach((dep) => {
        const cache = this._depcache[dep]
        if (cache) {
          if (cache.indexOf(dep) < 0) {
            cache.push(path)
          }
        } else {
          this._depcache[dep] = [path]
        }
      })
    }
  }

  /**
   * Export the template as a module
   * @param {string} path File path
   * @param {string} tmpl JS function
   */
  _export (path, tmpl) {
    return path === null ? `module.exports = ${tmpl};\n` : `${tmpl};\nmodule.exports = template;\n`
  }

}

PugCompiler.prototype.brunchPlugin = true
PugCompiler.prototype.type = 'template'
PugCompiler.prototype.pattern = /\.(?:pug|jade)$/
PugCompiler.prototype.staticTargetExtension = 'html'

module.exports = PugCompiler
