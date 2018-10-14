// @ts-nocheck
/* eslint object-shorthand:0 */
'use strict'

const Plugin = require('..')
const sysPath = require('path')
const fs = require('fs')

process.chdir(__dirname)

function wrapFunc (tmpl) {
  if (typeof tmpl != 'string') {
    tmpl = tmpl.data
  }

  tmpl = tmpl
    .replace(/module\.exports\s*=\s*template\b/, 'return template(_locals)')
    .replace(/module\.exports\s*=\s*/, 'return ')

  // eslint-disable-next-line no-new-func
  return new Function('_locals', tmpl)
}

const customMatchers = {
  toBeA: function () {
    return {
      compare: function (actual, expected) {
        const pass = typeof actual === expected
        return {
          pass,
          message: pass
            ? `Expected ${typeof actual} not to be an ${expected}`
            : `Expected ${typeof actual} to be an ${expected}`,
        }
      },
    }
  },
}

describe('Plugin', function () {
  const brunchOpts = {
    paths: { root: '.' },
    plugins: {
      pug: {
        inlineRuntimeFunctions: true,
        compileDebug: false,
      },
    },
  }
  let plugin

  beforeEach(function () {
    plugin = new Plugin(brunchOpts)
    jasmine.addMatchers(customMatchers)
  })

  it('should be an object', function () {
    expect(plugin).toBeTruthy()
    expect(plugin).toBeA('object')
  })

  it('should has #compile method', function () {
    expect(plugin.compile).toBeA('function')
  })

  it('should compile and produce valid result', function () {
    const content = 'doctype html'
    const expected = '<!DOCTYPE html>'

    return plugin.compile({ data: content, path: 'template.pug' })
      .then((data) => {
        const fn = wrapFunc(data)
        expect(fn()).toBe(expected)
      })
  })

  it('should compile and replace names in locals', function () {
    const content = 'p= name'
    const context = { name: 'John' }
    const expected = '<p>John</p>'

    return plugin.compile({ data: content, path: 'template.pug' })
      .then(function (data) {
        const html = wrapFunc(data)(context)
        expect(html.trim()).toBe(expected)
      })
  })

})


describe('runtime', function () {
  const brunchOpts = {
    paths: { root: '.' },
    plugins: { pug: {} },
  }

  beforeEach(function () {
    brunchOpts.plugins.pug = {}
    jasmine.addMatchers(customMatchers)
  })

  it('with the default options should include the runtime', function () {
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include[0]).toMatch(/runtime\b/)
  })

  it('`pugRuntime:false` should exclude the runtime regardless other options', function () {
    brunchOpts.plugins.pug.pugRuntime = false
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include[0]).toBeUndefined()
  })

  it('explicit `inlineRuntimeFunctions:true` also excludes the runtime', function () {
    brunchOpts.plugins.pug.inlineRuntimeFunctions = true
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include[0]).toBeUndefined()
  })

  it('setting `ipreCompilePattern:/\\S/` also excludes the runtime', function () {
    brunchOpts.plugins.pug.preCompilePattern = /\S/
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include[0]).toBeUndefined()
  })

  it('`preCompile` was removed and generates error', function () {
    brunchOpts.plugins.pug.preCompile = true
    expect(() => new Plugin(brunchOpts)).toThrow()
  })

  /* @TODO test in subdir
  it('when included, the runtime file should exist', function () {
    brunchOpts.plugins.pug.inlineRuntimeFunctions = false
    const plugin = new Plugin(brunchOpts)
    const exists = plugin.include[0] && fs.existsSync(plugin.include[0])
    expect(exists).toBe(true, `The runtime in "${plugin.include[0]}" does not exists!`)
  })*/

  it('`pugRuntime` only works with boolean', function () {
    brunchOpts.plugins.pug.pugRuntime = './lib/custom.js'
    expect(() => new Plugin(brunchOpts)).toThrow()
  })

})


describe('compilation', function () {
  const brunchOpts = {
    paths: { root: '.' }, plugins: { pug: {} },
  }

  beforeEach(function () {
    delete (typeof window != 'undefined' ? window : global).pug
    brunchOpts.plugins.pug = {}
    jasmine.addMatchers(customMatchers)
  })

  it('generates raw html for files ending with `.html.pug`', function () {
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    const content = 'p= name'
    const plugin = new Plugin(brunchOpts)

    return plugin.compile({ data: content, path: 'template.html.pug' })
      .then(function (data) {
        const html = wrapFunc(data)()
        expect(html.trim()).toBe('<p>John Doe</p>')
      })
  })

  it('generates raw html export for custom regex, ex: `/\\.static\\.pug$/`', function () {
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    brunchOpts.plugins.pug.preCompilePattern = /\.static\.pug/
    const content = 'p= name'
    const plugin = new Plugin(brunchOpts)

    return plugin.compile({ data: content, path: 'template.static.pug' })
      .then(function (data) {
        const html = wrapFunc(data)()
        expect(html.trim()).toBe('<p>John Doe</p>')
      })
  })

  it('generates unwrapped raw html for the `assets` directory', function () {
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    const content = 'p= name'
    const plugin = new Plugin(brunchOpts)

    return plugin.compileStatic({ data: content, path: 'app/assets/template.pug' })
      .then(function (data) {
        expect(data.trim()).toBe('<p>John Doe</p>')
      })
  })

  it('should work with the preloaded runtime (global `pug` variable)', function () {
    brunchOpts.plugins.pug.pugRuntime = false

    const locals  = { name: 'John Doe' }
    const content = 'p= name'
    const plugin  = new Plugin(brunchOpts)

    require('../vendor/pug_runtime')

    return plugin.compile({ data: content, path: 'template.pug' })
      .then(function (data) {
        const html = wrapFunc(data)(locals)
        expect(html.trim()).toBe('<p>John Doe</p>')
      })
  })
})


describe('dependencies', function () {
  const brunchOpts = {
    paths: { root: '.' },
    plugins: { pug: {} },
  }

  beforeEach(function () {
    jasmine.addMatchers(customMatchers)
  })

  it('should output valid deps', function () {
    const filename = 'app/index.pug'
    const content  = [
      'include valid1',
      'include valid1.pug',
      'include ../app/valid1',
      'include ../app/valid1.pug',
      'include /valid1.pug',
      'include /scripts/scripts1',
      'include scripts/scripts1',
      'include scripts/scripts1.pug',
      'include valid2',
    ].join('\n')
    const expected = [
      sysPath.join('app', 'valid1.pug'),
      sysPath.join('app', 'scripts', 'scripts1.pug'),
      sysPath.join('app', 'scripts', 'scripts2.pug'),
      sysPath.join('app', 'valid2.pug'),
    ]
    const plugin = new Plugin(brunchOpts)

    return plugin.compile({ data: content, path: filename }).then(function (data) {
      if (typeof data != 'string') {
        data = data.data
      }
      expect(data).toBeA('string')

      return plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toBeFalsy()
        expect(dependencies + '').toBe(expected + '')
      })
    })
  })

  it('should output valid deps for assets', function () {
    const filename = 'app/assets/deps.pug'
    const content  = [
      'html',
      '  body',
      '    include footer.pug',
      '',
    ].join('\n')
    const expected = [
      sysPath.join('app', 'assets', 'footer.pug'),
    ]
    const plugin = new Plugin(brunchOpts)

    return plugin.compileStatic({ data: content, path: filename }).then(function (data) {
      if (typeof data != 'string') {
        data = data.data
      }
      expect(data).toBeA('string')

      return plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toBeFalsy()
        expect(dependencies + '').toBe(expected + '')
      })
    })
  })

  it('dependency overwride should output valid deps', function () {
    const filename = 'custom/index.pug'
    const content  = fs.readFileSync(filename, 'utf8')
    const expected = [
      sysPath.join('custom', 'layout.pug'),
      sysPath.join('custom', 'footer.pug'),
    ]
    // pug only outputs actually found files?
    brunchOpts.plugins.pug.basedir = 'custom'
    const plugin = new Plugin(brunchOpts)

    return plugin.compile({ data: content, path: filename }).then(function (data) {
      if (typeof data != 'string') {
        data = data.data
      }
      expect(data).toBeA('string')

      return plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toBeFalsy()
        expect(dependencies).toEqual(expected)
      })
    })
  })

  it('with no dependencies should return empty array', function () {
    const filename = 'app/index3.pug'
    const content  = 'p'
    const expected = []
    // pug only outputs actually found files?
    const plugin = new Plugin(brunchOpts)

    return plugin.compile({ data: content, path: filename }).then(function (data) {
      expect(data).toBeA('object')
      expect(data.data).toBeA('string')

      return plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toBeFalsy()
        expect(dependencies).toEqual(expected)
      })
    })
  })

  it('with unprocessed file should return empty array', function () {
    const filename = 'app/indexX.pug'
    const content  = ''
    const expected = []
    // pug only outputs actually found files?
    const plugin = new Plugin(brunchOpts)

    return plugin.compile({ data: content, path: filename }).then(function (data) {
      expect(data).toBeA('object')
      expect(data.data).toBeA('string')

      plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toBeFalsy()
        expect(dependencies).toEqual(expected)
      })
    })
  })

  it('should work in the `asset` directory', function () {
    brunchOpts.plugins.pug.pretty = true
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    const filename = 'app/assets/index.pug'
    const content  = fs.readFileSync(filename, 'utf8')
    const expected = `<!DOCTYPE html>
<html>
  <head>
    <title>Article Title</title>
  </head>
  <body>
    <h1>My Article</h1>
    <footer>Done.</footer>
  </body>
</html>`

    const plugin = new Plugin(brunchOpts)

    return plugin.compileStatic({ data: content, path: filename })
      .then(function (data) {
        expect(data.trim()).toBe(expected)
      })
  })
})
