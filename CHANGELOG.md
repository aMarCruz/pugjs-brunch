# Changes for pugjs-brunch

### 2016-12-28 v2.8.6
- Updated README.
- `preCompilePattern` option to limit the pre-compilation to matching files (use with `preCompile:true`).
- Fix [#2](https://github.com/aMarCruz/pugjs-brunch/issues/2) : wrong directory for includes?

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
