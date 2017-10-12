# Changes for pugjs-brunch

### 2017-10-12 v2.10.1
- Uses Pug v2.0.0-rc.4 or higher.
- Adds `Promise` to predefined globals.

### 2017-02-02 v2.10.0
- Using Pug v2.0.0-beta11.
- Minor fixes to README.
- Updated devDependencies.

### 2017-02-02 v2.9.0
- Supports Brunch v2.9.x and v2.10.x
- Using Pug v2.0.0-beta10 which fix some bugs and has better error reporting.
- New logic to load the custom runtime. It does not overwrites an existing "pug" object and uses `module.exports` if exists in the context. Also try to work with symlinks.
- JS natives `String`, `Number`, `Boolean`, `Date`, `Array`, `Function`, `Math`, `RegExp`, and the scoped `require` are included in `globals[]`, in addition to your own names.
- Requires node.js v4.2 or above.
- Updated devDependencies.

### 2016-12-28 v2.8.6
- `preCompilePattern` option to limit the pre-compilation to matching files (use with `preCompile:true`).
- Fix [#2](https://github.com/aMarCruz/pugjs-brunch/issues/2) : wrong directory for includes?
- Updated README.
- Updated devDependencies.

### 2016-11-03 v2.8.6

- Fix build & test issues in node 4 & 5 by using strict mode.

### 2016-11-03 v2.8.5

- Source maps are flatten if any previous exists. That allows, by example, to use [jscc-brunch](https://www.npmjs.com/package/jscc-brunch) in Pug templates with both `sourceMap` options enabled.
- New `staticPretty` option that set Pug's `pretty` option for files in `staticBasedir`, usually your app/assets directory.

### 2016-11-02 v2.8.4

- Now `sourceMap` option defaults to the global Brunch option, no need `compileDebug`.
- Updated gen-pug-source-map dependency, fixing some issues.

### 2016-10-29 v2.8.3

- Experimental support for source map.

### 2016-10-29 v2.8.2

- First public release, using Pug v2.0.2-beta6
