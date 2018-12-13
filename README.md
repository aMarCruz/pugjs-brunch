# pugjs-brunch

[![npm Version][npm-image]][npm-url]
[![Windows build][wbuild-image]][wbuild-url]
[![Build Status][build-image]][build-url]
[![License][license-image]][license-url]

Adds [Pug](https://pugjs.org) v2.x (aka Jade) support to [Brunch](http://brunch.io)

This plugin compiles templates into any of three types:

- Dynamic: Parameterized function that creates HTML at runtime based on the received parameters.
- Precompiled: Returns raw HTML string with minimum overhead at runtime.
- Static: Plain HTML files from pug templates in the `assets` directory.

See the changes for this version in the [CHANGELOG](CHANGELOG.md).

## Install

```bash
npm install pugjs-brunch --save-dev
# or
yarn add pugjs-brunch -D
```

or through `devDependencies` in `package.json`:

```js
  "pugjs-brunch": "^2.11.2",
```

To compile pug into static, plain HTML, just place your files into the assets directory (usually `app/assets`).

## The runtime

For modules, unless the `inlineRuntimeFunctions` option is set to `true` (not recommended), it is neccesary the Pug runtime, a small set of functions that lives in the *global* variable `pug`.

If required, the plugin loads a runtime from its own directory, so you don't have to worry about this.

**NOTE:**

Under certain circumstances the loading of the runtime may fail. If this happens to you, move `pug_runtime.js` from `node_modules/pugjs-brunch/vendor` to your `vendor` folder and load it in the global scope. Example:

```js
  // In your brunch config
  plugins: {
    pug: { pugRuntime: false }
  }
```

```html
  <!-- in your index.html file -->
  <script>
    require('pug_runtime')
    $(document).ready(function() {
      require('app')
    })
  </script>
```

## Options

The plugin uses the `plugins.pug` section of your brunch-config and defines this properties:

Name            | Type    | Default    | Notes
--------------- | ------- | ---------- | -----------
`locals`        | any     |            |  Plain JavaScript object passed to Pug for static compilation.
`staticBasedir` | string  | (brunch)   | Brunch `convention.assets` folder as **string**. This is the root of static templates.
`staticPretty`  | boolean | true       | Pug's `pretty` option for files in `staticBasedir`, see NOTE (v2.8.5).
`preCompilePattern` | RegExp | /\.html\.pug$/ | pre-compile the templates matching this regex (v2.8.6).
`pugRuntime`    | boolean | true       | Set to `false` if you want to load another runtime.
`sourceMap`     | boolean | true       | Defaults to brunch `sourceMaps` (with 's') value, `false` disables it (v2.8.4).

### Note

From v2.11.1 `staticPretty` is set to `false` for production builds. Thanks to @stawberri

You can use any [Pug options](https://pugjs.org/api/reference.html) as well, pugjs-brunch set this:

```js
{
  doctype: 'html',
  basedir: 'app',      // or wherever Brunch config says
  compileDebug: true,  // false if brunch `optimize` mode is 'production'
}
```

**TIP:**

Use `preCompilePattern: /\S/` to evaluate all the templates at build time.

### About `staticBasedir`

This option is only meaningful if you changed the default value of `conventions.assets` in the Brunch config and you are using absolute paths in includes or extends. This value will be pass to Pug as `basedir` when compiling static assets as html (see the [pug options](https://pugjs.org/api/reference.html#options)).

**NOTE:**

The options `pretty` and `compileDebug` are forced to `false` in production mode.

## Examples

### Dynamic templates

```js
  // brunch-config.js
  ...
  plugins: {
    pug: {}
  },
```

```jade
  //- app/views/tmpl.pug
  p= name
```

```js
  // in the js code
  ...
  const tmplFn = require('views/tmpl.pug')
  $('#elem').html(tmplFn({ name: 'John Doe' }))
  // now #elem contains <p>John Doe</p>
```

### Precompilation

```js
  // brunch-config.js
  ...
  plugins: {
    pug: {
      locals: { name: 'John Doe' },
      preCompilePattern: /\.html\.pug$/
    }
  },
```

```jade
  //- app/views/tmpl.html.pug
  p= name
```

```js
  // in the js code
  ...
  const htmlStr = require('views/tmpl.html.pug')
  $('#elem').html(htmlStr)
  // now #elem contains <p>John Doe</p>
```

### Static files

```js
  // brunch-config.js
  ...
  plugins: {
    pug: {
      locals: { name: 'John Doe' }
    }
  },
```

```jade
  //- app/assets/user.pug
  doctype html
  html
    head
      meta(charset="utf-8")
    body
      p= name
```

will create the file ./public/user.html

### Using with [jscc-brunch](https://www.npmjs.com/package/jscc-brunch)

```js
  ...
  plugins: {
    jscc: {
      values: {
        _APP: 'My App'  // $_APP can do static replacement
      },
      pattern: /\.(?:js|pug)$/,
      sourceMapFor: /\.(?:js|pug)$/,
      sourceMap: true
    },
    pug: {
      globals: ['$_APP']
    }
  }
  ...
```

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

<!-- markdownlint-disable MD033 -->
[<img src="https://amarcruz.github.io/images/kofi_blue.png" height="36" title="Support Me on Ko-fi" />][kofi-url]
<!-- markdownlint-enable MD033 -->

Of course, feedback, PRs, and stars are also welcome 🙃

Thanks for your support!

## License

The [MIT License](LICENCE) (MIT)

&copy; 2016-2018 Alberto Martínez

[npm-image]:      https://img.shields.io/npm/v/pugjs-brunch.svg
[npm-url]:        https://www.npmjs.com/package/pugjs-brunch
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/pugjs-brunch/blob/master/LICENSE
[build-image]:    https://img.shields.io/travis/aMarCruz/pugjs-brunch.svg
[build-url]:      https://travis-ci.org/aMarCruz/pugjs-brunch
[wbuild-image]:   https://ci.appveyor.com/api/projects/status/3www03fp83018461?svg=true
[wbuild-url]:     https://ci.appveyor.com/project/aMarCruz/pugjs-brunch
[kofi-url]:       https://ko-fi.com/C0C7LF7I
