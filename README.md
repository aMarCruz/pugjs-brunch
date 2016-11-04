[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

## pugjs-brunch

Adds [Pug](https://pugjs.com) v2.x (.pug and .jade files) support to [Brunch](http://brunch.io), by
compiling templates into dynamic JavaScript modules with sourceMap and static HTML files.

**What's New**

- Source maps are flatten if any previous exists. That allows, by example, to use [jscc-brunch](https://www.npmjs.com/package/jscc-brunch) in Pug templates with both `sourceMap` options enabled.
- New `staticPretty` option that set Pug's `pretty` option for files in `staticBasedir`, usually your `app/assets` directory.

See previous changes in the [CHANGELOG](https://github.com/aMarCruz/pugjs-brunch/blob/master/CHANGELOG.md).


## Install

```bash
npm install pugjs-brunch --save-dev
```

or through `package.json`:

```js
    ...
    "pugjs-brunch": "^2.8.5",
// or, if you want to use git version of plugin:
    "pugjs-brunch": "aMarCruz/pugjs-brunch",
    ...
```

To compile pug/jade into plain HTML, just place your files into `staticBasedir` (usually your `app/assets` directory).


## The runtime

For modules, unless the `inlineRuntimeFunctions` option is set to `true`, it is neccesary the Pug runtime,
a small set of function that lives in the global variable `pug`.

If required, the plugin loads the runtime from its own directory, so you don't have to worry about this.

## Options

The plugin uses the `plugins.pug` section of your brunch-config and defines this options:

`locals` - Plain JavaScript object passed to Pug in static compilation.

`staticBasedir` - Files in this folder will output raw html.

`staticPretty` - Pug's `pretty` option for files in `staticBasedir` (v2.8.5).

`preCompile` - When `true`, all the files will be pre-compiled.

`pugRuntime` - Set to `false` if you want to load another runtime.

`sourceMap` - Defaults to brunch `sourceMaps` (with 's') value, `false` disables it (v2.8.4).

You can use any [Pug options](https://pugjs.org/api/reference.html) as well, pugjs-brunch set this:

```js
{
  doctype: 'html',
  basedir: 'app',                 // or wherever Brunch config says
  staticBasedir: 'app/assets',    // or wherever Brunch config says
  staticPretty: true,             // "pretty" for files in staticBasedir
  inlineRuntimeFunctions: false,  // will use the global `pug` variable
  compileDebug: true,             // except for brunch `optimize` mode (production)
  sourceMap: true                 // ...if Brunch sourceMaps option is enabled
}
```

**NOTE**

For files in `staticBasedir`, the basedir for `include` and `extends` will be assumed to be `staticBasedir`.

The options `pretty` and `compileDebug` are forced to `false` in production mode.


### Examples

```js
  ...
  plugins: {
    pug: {
      pretty: true,
      locals: {
        appName: 'My App',
      },
      globals: ['App']
    }
  }
  ...
```

Using with [jscc-brunch](https://www.npmjs.com/package/jscc-brunch)...

```js
  ...
  plugins: {
    jscc: {
      values: {
        _APP: 'My App'  // $_APP can do static replacement
      },
      pattern: /\.(?:js|pug)$/,
      sourceMapFor: /\.(?:js|pug)$/
    },
    pug: {
      locals: {
        appName: 'My App',
      },
      globals: ['App']
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
