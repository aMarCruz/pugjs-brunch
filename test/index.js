/* eslint-env mocha */
/* eslint prefer-arrow-callback:0, prefer-template:0, no-console:0, no-debugger:0, no-eval:0, no-unused-expressions:0 */

const expect = require('expect')
const Plugin = require('../')
//const pug = require('pug');
const sysPath = require('path')
const fs = require('fs')

process.chdir(__dirname)

function wrapFunc (tmpl) {
  tmpl = tmpl
    .replace('function pug_escape(e){', '$&\n')
    .replace(';function template(locals) {', '\n$&\n')
    .replace(/module\.exports\s*=\s*template\b/, 'return template(_locals)')
    .replace(/module\.exports\s*=\s*/, 'return ')

  // eslint-disable-next-line no-new-func
  return new Function('_locals', tmpl)
}


describe('Plugin', function () {
  const brunchOpts = {
    paths: { root: '.' },
    plugins: {
      pug: {
        inlineRuntimeFunctions: true,
        compileDebug: false
      }
    }
  }
  let plugin

  beforeEach(function () {
    plugin = new Plugin(brunchOpts)
  })

  it('should be an object', function () {
    expect(plugin).toExist()
    expect(plugin).toBeAn(Object)
  })

  it('should has #compile method', function () {
    expect(plugin.compile).toBeA(Function)
  })

  it('should compile and produce valid result', function (done) {
    const content = 'doctype html'
    const expected = '<!DOCTYPE html>'

    plugin.compile({ data: content, path: 'template.pug' })
      .then((data) => {
        const fn = wrapFunc(data)
        expect(fn()).toBe(expected)
        done()
      })
      .catch(done)
  })

  it('should compile and replace names in locals', function (done) {
    const content = 'p= name'
    const context = { name: 'John' }
    const expected = '<p>John</p>'

    plugin.compile({ data: content, path: 'template.pug' })
      .then(function (data) {
        const fn = wrapFunc(data)
        const html = fn(context)
        expect(html.trim()).toBe(expected)
        done()
      })
      .catch(done)
  })

})


describe('runtime', function () {
  const brunchOpts = {
    paths: { root: '.' },
    plugins: { pug: {} }
  }

  beforeEach(function () {
    brunchOpts.plugins.pug = {}
  })

  it('with the default options should include the runtime', function () {
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include).toExist()
  })

  it('`pugRuntime:false` should exclude the runtime regardless other options', function () {
    brunchOpts.plugins.pug.pugRuntime = false
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include).toNotExist()
  })

  it('explicit `inlineRuntimeFunctions:true` excludes the runtime', function () {
    brunchOpts.plugins.pug.inlineRuntimeFunctions = true
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include).toNotExist()
  })

  it('setting `preCompile:true` also excludes the runtime', function () {
    brunchOpts.plugins.pug.preCompile = true
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include).toNotExist()
  })

  it('when included, the runtime.js file should exist', function () {
    brunchOpts.plugins.pug.inlineRuntimeFunctions = false
    const plugin = new Plugin(brunchOpts)
    expect(fs.existsSync(plugin.include[0])).toExist()
  })

  it('`noRuntime:true` to exclude the runtime is DEPRECATED', function () {
    brunchOpts.plugins.pug.noRuntime = true
    const plugin = new Plugin(brunchOpts)
    expect(plugin.include).toNotExist()
  })

})


describe('compilation', function () {
  const brunchOpts = {
    paths: { root: '.' }, plugins: { pug: {} }
  }

  beforeEach(function () {
    brunchOpts.plugins.pug = {}
  })

  it('generates raw html with the `preCompile:true` option', function (done) {
    brunchOpts.plugins.pug.preCompile = true
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    const content = 'p= name'
    const plugin = new Plugin(brunchOpts)

    plugin.compile({ data: content, path: 'template.pug' })
      .then(function (data) {
        const fn = wrapFunc(data)
        const html = fn()
        expect(html.trim()).toBe('<p>John Doe</p>')
        done()
      })
      .catch(done)
  })

  /*
  it('generates raw html for names ending in `static.pug`', function (done) {
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    const content = 'p= name'
    const plugin = new Plugin(brunchOpts)

    plugin.compile({ data: content, path: 'template.static.pug' })
      .then(function (data) {
        const fn = wrapFunc(data)
        const html = fn()
        expect(html.trim()).toBe('<p>John Doe</p>')
        done()
      })
      .catch(done)
  })*/

  it('generates unwrapped raw html for the `asset` directory', function (done) {
    brunchOpts.plugins.pug.locals = { name: 'John Doe' }
    const content = 'p= name'
    const plugin = new Plugin(brunchOpts)

    plugin.compileStatic({ data: content, path: 'app/assets/template.pug' })
      .then(function (data) {
        const html = data
        expect(html.trim()).toBe('<p>John Doe</p>')
        done()
      })
      .catch(done)
  })

  it('should work with preloaded runtime (global `pug` variable)', function (done) {

    brunchOpts.plugins.pug.pugRuntime = false
    brunchOpts.plugins.pug.inlineRuntimeFunctions = false

    const locals  = { name: 'John Doe' }
    const content = 'p= name'
    const plugin  = new Plugin(brunchOpts)

    require('../runtime')

    plugin.compile({ data: content, path: 'template.pug' })
      .then(function (data) {
        const fn = wrapFunc(data)
        const html = fn(locals)
        expect(html.trim()).toBe('<p>John Doe</p>')
        done()
      })
      .catch(done)
  })
})


describe('dependencies', function () {
  const brunchOpts = {
    paths: { root: '.' },
    plugins: {
      pug: {
        inlineRuntimeFunctions: false
      }
    }
  }

  it('should output valid deps', function (done) {
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
      'include valid2'
    ].join('\n')
    const expected = [
      sysPath.join('app', 'valid1.pug'),
      sysPath.join('app', 'scripts', 'scripts1.pug'),
      sysPath.join('app', 'scripts', 'scripts2.pug'),
      sysPath.join('app', 'valid2.pug')
    ]
    const plugin = new Plugin(brunchOpts)

    plugin.compile({ data: content, path: filename }).then(function (data) {
      expect(data).toBeA('string')

      plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toNotExist()
        expect(dependencies + '').toBe(expected + '')
        done()
      })
    }).catch(done)
  })

  it('dependency overwride should output valid deps', function (done) {
    const filename = 'custom/index.pug'
    const content  = fs.readFileSync(filename, 'utf8')
    const expected = [
      sysPath.join('custom', 'layout.pug'),
      sysPath.join('custom', 'footer.pug')
    ]
    // pug only outputs actually found files?
    brunchOpts.plugins.pug.basedir = 'custom'
    const plugin = new Plugin(brunchOpts)

    plugin.compile({ data: content, path: filename }).then(function (data) {
      expect(data).toBeA('string')

      plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toNotExist()
        expect(dependencies).toEqual(expected)
        done()
      })
    }).catch(done)
  })

  it('with no dependencies should return empty array', function (done) {
    const filename = 'app/index3.pug'
    const content  = ''
    const expected = []
    // pug only outputs actually found files?
    const plugin = new Plugin(brunchOpts)

    plugin.compile({ data: content, path: filename }).then(function (data) {
      expect(data).toBeA('string')

      plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toNotExist()
        expect(dependencies).toEqual(expected)
        done()
      })
    }).catch(done)
  })

  it('with unprocessed file should return empty array', function (done) {
    const filename = 'app/indexX.pug'
    const content  = ''
    const expected = []
    // pug only outputs actually found files?
    const plugin = new Plugin(brunchOpts)

    plugin.compile({ data: content, path: filename }).then(function (data) {
      expect(data).toBeA('string')

      plugin.getDependencies(content, filename, function (error, dependencies) {
        expect(error).toNotExist()
        expect(dependencies).toEqual(expected)
        done()
      })
    }).catch(done)
  })

  it('should work in the `asset` directory', function (done) {
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

    plugin.compileStatic({ data: content, path: filename })
      .then(function (data) {
        const html = data
        expect(html.trim()).toBe(expected)
        done()
      })
      .catch(done)
  })
})
