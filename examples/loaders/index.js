'use strict';

var arr = require('arr');
var slice = require('array-slice');

/**
 * Expose `Engine`
 */

module.exports = Engine;

/**
 * Example application using load-templates
 *
 * ```js
 * var Engine = require('engine');
 * var engine = new Engine();
 * ```
 *
 * @param {[type]} options
 */

function Engine(options) {
  this.options = options || {};
  this.views = {};
  this.defaultTemplates();
}

/**
 * Add some default template "types"
 */

Engine.prototype.defaultTemplates = function () {
  this.create('partial', 'partials', { promise: true });
  this.create('layout', 'layouts', { async: true });
  this.create('page', 'pages');
};

/**
 * Default loader for loading templates.
 */

Engine.prototype.loadSync = function loadSync () {
  var Loader = require('load-templates');
  var loader = new Loader(this.options);
  return loader.load.apply(loader, arguments);
};

/**
 * Default loader for loading templates.
 */

Engine.prototype.loadAsync = function loadAsync () {
  var Loader = require('load-templates');
  var loader = new Loader(this.options);
  var args = slice(arguments);
  var done = args.pop();
  setTimeout(function () {
    done(null, loader.load.apply(loader, args));
  }, 5);
};

/**
 * Default promise loader
 */

Engine.prototype.loadPromise = function loadPromise () {
  var Promise = require('bluebird');
  var deferred = Promise.pending();
  var Loader = require('load-templates');
  var loader = new Loader(this.options);
  var args = slice(arguments);
  setTimeout(function () {
    deferred.fulfill(loader.load.apply(loader, args));
  }, 5);
  return deferred.promise;
};

/**
 * Choose the loader for loading templates
 */

Engine.prototype.load = function load () {
  var fns = arr.filterType(arguments, 'function');
  if (fns.length > 0) {
    // use async loader
    return this.loadAsync.apply(this, arguments);
  }
  return this.loadSync.apply(this, arguments);
};

/**
 * Create template "types"
 *
 * @param  {String} `type` The singular name of the type, e.g. `page`
 * @param  {String} `plural` The plural name of the type, e.g. `pages.
 * @return {String}
 */

Engine.prototype.create = function (type, plural, options) {
  this.views[plural] = this.views[plural] || {};
  options = options || {};
  var isAsync = options.async;
  var isPromise = options.promise;
  var fns = arr.filterType(arguments, 'function');
  var loader = isAsync ? this.loadAsync : this.loadSync;
  loader = isPromise ? this.loadPromise : loader;
  var done = function (err, templates) {
    if (err) throw err;
    return templates;
  };

  if (fns.length > 0) {
    loader = fns[0];
    done = fns[1] || done;
  }

  Engine.prototype[type] = function (key, value, locals, options) {
    return this[plural].apply(this, arguments);
  };

  Engine.prototype[plural] = function (key, value, locals, options) {
    return handleLoader(loader, plural, isAsync, isPromise, done).apply(this, arguments);
  };

  return this;
};

function handleLoader (loader, plural, isAsync, isPromise, done) {
  return function () {
    var self = this;
    var args = slice(arguments);
    var options = arr.last(args, 'object');
    var fns = arr.filterType(args, 'function');
    if (options.async) {
      isAsync = options.async;
      loader = this.loadAsync;
    }
    if (options.promise) {
      isPromise = options.promise;
      loader = this.loadPromise;
    }


    if (isAsync) {
      switch (fns.length) {
        case 0: throw new Error('Expected a callback function.');
        case 1: done = fns[0]; break;
        case 2:
          loader = fns[0];
          done = fns[1];
      }
      loader = callbackify(loader, function (cb) {
        return function (err, template) {
          if (err) return cb(err);
          extend(self.views[plural], template);
          cb(null, template);
        };
      });
      loader.apply(self, args);
      return self;
    }


    if (isPromise) {
      return loader.apply(self, args)
        .then(function (templates) {
          extend(self.views[plural], templates);
        });
    }


    var templates = loader.apply(self, args);
    extend(self.views[plural], templates);
    return self;
  };
}

function callbackify (fn, done) {
  return function () {
    var args = slice(arguments);
    var cb = args.pop();
    if (typeof cb !== 'function') {
      args.push(cb);
      cb = function () {};
    }
    args.push(done(cb));
    fn.apply(this, args);
  };
}

function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}
