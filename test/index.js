// setup Jasmine
const Jasmine = require('jasmine')
const jasmine = new Jasmine()
jasmine.loadConfig({
  spec_dir: 'test',
  spec_files: ['**/*spec.js'],
  helpers: ['helpers/**/*.js'],
  random: false,
  seed: null,
  stopSpecOnExpectationFailure: false,
})
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000

// setup console reporter
const JasmineConsoleReporter = require('jasmine-console-reporter')
const reporter = new JasmineConsoleReporter({
  colors: 1,           // (0|false)|(1|true)|2
  cleanStack: 1,       // (0|false)|(1|true)|2|3
  verbosity: 4,        // (0|false)|1|2|(3|true)|4|Object
  listStyle: 'indent', // "flat"|"indent"
  timeUnit: 'ms',      // "ms"|"ns"|"s"
  timeThreshold: { ok: 500, warn: 1000, ouch: 3000 }, // Object|Number
  activity: true,
  emoji: true,         // boolean or emoji-map object
  beep: true,
})

// initialize and execute
jasmine.env.clearReporters()
jasmine.addReporter(reporter)
jasmine.execute()
