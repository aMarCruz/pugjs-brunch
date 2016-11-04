/* eslint max-len:0 */
'use strict'

const path = require('path')
const fs = require('fs')

const indent = '  '
const prefix = ";(typeof window!='undefined'?window:typeof global!='undefined'?global:this).pug={}\n;(function(exports){\n"
const suffix = '\n})(pug);\n'

let pugPath = require.resolve('pug-runtime')
let runtime = fs.readFileSync(pugPath, 'utf8')

runtime = runtime.replace(/^(?=\s*\S)/gm, indent)

pugPath = path.join(__dirname, 'runtime.js')
runtime = `${prefix}${runtime}${suffix}`

fs.writeFileSync(pugPath, runtime, 'utf8')

console.log(`${pugPath} written.`) //eslint-disable-line no-console
