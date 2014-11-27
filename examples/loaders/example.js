'use strict';

var util = require('util');
var Engine = require('./');
var engine = new Engine();
var async = require('async');

var demoLoadSync = function () {
  var template = this;
  return template.loadSync.apply(template, arguments);
};

var demoLoadAsync = function () {
  var template = this;
  template.loadAsync.apply(template, arguments);
};

var demoLoadPromise = function () {
  var template = this;
  return template.loadPromise.apply(template, arguments);
};

/**
 * Load some seriously disorganized templates
 */

async.series(
  [
    // layouts are async
    function (next) { engine.layout('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'}, next); },
    function (next) { engine.layout('layouts/*.txt', {name: 'Brian Woodward'}, demoLoadAsync, next); },
    function (next) { engine.layout('test/fixtures/a.md', {a: 'b'}, next); },

    // pages are sync
    function (next) { engine.page('abc.md', 'This is content.', {name: 'Jon Schlinkert'}); next(); },
    function (next) { engine.page('foo1.md', 'This is content', {name: 'Jon Schlinkert'}); next(); },
    function (next) { engine.page(['test/fixtures/one/*.md'], {a: 'b'}, demoLoadSync); next(); },
    function (next) { engine.page({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}); next(); },
    function (next) { engine.page({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true}); next(); },
    function (next) { engine.page({'test/fixtures/a.txt': {path: 'a.md', a: 'b'}}); next(); },
    // load a couple pages with async
    function (next) { engine.page({path: 'test/fixtures/three/a.md', foo: 'b'}, {async: true}, demoLoadAsync, next); },
    function (next) { engine.pages('fixtures/two/*.md', {name: 'Brian Woodward'}, {async: true}, next); },
    function (next) { engine.pages('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'}); next(); },
    // load a some pages with promises
    function (next) { engine.pages('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'}, {promise: true}).then(next); },
    function (next) { engine.pages('test/fixtures/a.md', {foo: 'bar'}, {promise: true}, demoLoadPromise).then(next); },
    function (next) { engine.pages('test/fixtures/three/*.md', {name: 'Brian Woodward'}, {promise: true}).then(next); },
    function (next) { engine.pages(['test/fixtures/a.txt'], {name: 'Brian Woodward'}); next(); },

    // partials are promises
    function (next) { engine.partial({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}}).then(next); },
    function (next) { engine.partial({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}}, demoLoadPromise).then(next); }
  ],
  function (err) {
    if (err) console.log('err', err);
    console.log(util.inspect(engine, null, 10));
  });
