[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

## pugjs-brunch

Adds [Pug](https://pugjs.com) v2.x (.pug and .jade files) support to [brunch](http://brunch.io), by
compiling templates into dynamic javascript modules and static html files.

**NOTE:**
v2.8.3 has experimental support for source map, you can enable it with the `sourceMap` option.

## Usage

Install the plugin via npm with `npm install --save pugjs-brunch`.

Or, do manual install:

* Add `"pugjs-brunch": "x.y.z"` to `package.json` of your brunch app.
  Pick a plugin version that corresponds to your minor (y) brunch version.
* If you want to use git version of plugin, add
`"pugjs-brunch": "git+ssh://git@github.com:aMarCruz/pugjs-brunch.git"`.

You can also use `pugjs-brunch` to compile pug/jade into html. Just place your files into `app/assets`.

## Assumptions

When using Pug's basedir relative `include` and `extend`, the basedir will be assumed to be 'app' within the Brunch root. See [#989](https://github.com/visionmedia/jade/pull/989)

For pug files in `app/assets`, the basedir will be assumed to be `app/assets`.

## The runtime

For modules, unless the `inlineRuntimeFunctions` option is set to `true`, it is neccesary the Pug runtime,
a small set of function that lives in the global variable `pug`.

If required, the plugin loads the runtime from its own directory, so you don't have to worry about this.

## Options

The plugin defines this options:

`locals` - Plain JavaScript object passed to Pug in static compilation.

`staticBasedir` - Files in this folder will output raw html.

`preCompile` - When `true`, all the files will be pre-compiled.

`pugRuntime` - Set to `false` if you want to load another runtime.

`sourceMap` - `true` to enable source map support (keep `compileDebug:true` as well).

You can use any [Pug options](https://pugjs.org/api/reference.html) using the `plugins.pug` branch of your brunch-config, the plugin set this:

```js
{
  doctype: 'html',
  basedir: 'app',
  staticBasedir: 'app/assets',
  inlineRuntimeFunctions: false,  // will use the global `pug` variable
  compileDebug: true,             // except for brunch `optimize` mode (production)
  sourceMap: false
}
```

The options `pretty` and `compileDebug` are forced to `false` in production mode.

### Example

```js
  ...
  plugins: {
    pug: {
      pretty: true,
      locals: {
        appName: 'My App',
      }
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
