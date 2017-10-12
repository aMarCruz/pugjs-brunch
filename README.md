[![Windows build][wbuild-image]][wbuild-url]
[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

## pugjs-brunch

Adds [Pug](https://pugjs.org) v2.x (aka Jade) support to [Brunch](http://brunch.io)

This plugin compiles templates into any of three types:

- Dynamic: Parameterized function that creates HTML at runtime based on the received parameters.
- Precompiled: Returns raw HTML string with minimum overhead at runtime.
- Static: Plain HTML files from pug templates in the `assets` directory.

**What's New**

- Uses Pug v2.0.0-rc.4 or higher.
- Adds `Promise` to predefined globals.

See previous changes in the [CHANGELOG](https://github.com/aMarCruz/pugjs-brunch/blob/master/CHANGELOG.md).


## Install

```bash
npm install pugjs-brunch --save-dev
```

or through `devDependencies` in `package.json`:

```js
    ...
    "pugjs-brunch": "^2.10.1",
// or, if you want to use the git version of this plugin:
    "pugjs-brunch": "aMarCruz/pugjs-brunch",
    ...
```

To compile pug into static, plain HTML, just place your files into the assets directory (usually `app/assets`).


## The runtime

For modules, unless the `inlineRuntimeFunctions` option is set to `true` (not recommended), it is neccesary the Pug runtime, a small set of function that lives in the *global* variable `pug`.

If required, the plugin loads a custom runtime from its own directory, so you don't have to worry about this.

**NOTE:**

Under certain circumstances the runtime load may fail. If this happens to you, move `pug_runtime.js` from `node_modules/pugjs-brunch/vendor` to your `vendor` folder and pass its fullname in the `pugRuntime` option to the plugin.

Example:
```js
  plugins: {
    pug: { pugRuntime: require('path').resolve('.', 'vendor', 'pug_runtime.js') }
  }
```

## Options

The plugin uses the `plugins.pug` section of your brunch-config and defines this options:

`locals` - Plain JavaScript object passed to Pug for static compilation.

`staticBasedir` - Brunch `convention.assets` folder as **string**. This is the root of static templates.

`staticPretty` - Pug's `pretty` option for files in `staticBasedir` (v2.8.5).

`preCompile` - When `true`, all the files will be pre-compiled.

`preCompilePattern` - Regex: when `preCompile:true`, limit pre-compilation to matching files (v2.8.6).

`pugRuntime` - Set to `false` if you want to load another runtime.

`sourceMap` - Defaults to brunch `sourceMaps` (with 's') value, `false` disables it (v2.8.4).

You can use any [Pug options](https://pugjs.org/api/reference.html) as well, pugjs-brunch set this:

```js
{
  doctype: 'html',
  basedir: 'app',                 // or wherever Brunch config says
  staticBasedir: 'app/assets',    // basedir for static compilation (see bellow)
  staticPretty: true,             // "pretty" for files in staticBasedir
  inlineRuntimeFunctions: false,  // will use the global `pug` variable
  compileDebug: true,             // except for brunch `optimize` mode (production)
  sourceMap: true                 // ...if Brunch sourceMaps option is enabled
}
```

### About `staticBasedir`:

This option is only meaningful if you changed the default value of `conventions.assets` in the Brunch config and you are using absolute paths in includes or extends. This value will be pass to Pug as `basedir` when compiling static assets as html (see the [pug options](https://pugjs.org/api/reference.html#options)).


**NOTE**

The options `pretty` and `compileDebug` are forced to `false` in production mode.


## Examples

#### Dynamic templates (Regular usage)

```js
  // brunch-config.js
  ...
  plugins: {
    pug: {
      globals: ['App']
    }
  },
```

```jade
  //- app/views/tmpl.pug
  p= name
```

```js
  // later...
  App.userName = 'John Doe'
  ...
  const tmpl = require('views/tmpl.pug')
  $('#elem').html(tmpl({ name: App.userName }))
  // now elem contains <p>John Doe</p>
```

#### Selective precompilation

```js
  // brunch-config.js
  ...
  plugins: {
    pug: {
      locals: { name: 'John Doe' },
      preCompile: true,
      preCompilePattern: /\.html\.pug$/
    }
  },
```

```jade
  //- app/views/tmpl.html.pug
  p= name
```

```js
  // your javascript...
  ...
  const tmpl = require('views/tmpl.html.pug')
  $('#elem').html(tmpl)
  // now #elem contains <p>John Doe</p>
```

#### Static files

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

will output the new file public/user.html

#### Using with [jscc-brunch](https://www.npmjs.com/package/jscc-brunch)

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

## License

The [MIT License](LICENCE) (MIT)

[npm-image]:      https://img.shields.io/npm/v/pugjs-brunch.svg
[npm-url]:        https://www.npmjs.com/package/pugjs-brunch
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/pugjs-brunch/blob/master/LICENSE

[build-image]:    https://img.shields.io/travis/aMarCruz/pugjs-brunch.svg
[build-url]:      https://travis-ci.org/aMarCruz/pugjs-brunch
[wbuild-image]:   https://ci.appveyor.com/api/projects/status/3www03fp83018461?svg=true
[wbuild-url]:     https://ci.appveyor.com/project/aMarCruz/pugjs-brunch
