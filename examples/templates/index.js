'use strict';

/**
 * Expose `Engine`
 */

module.exports = Engine;

/**
 * Example application for loading templates
 *
 * ```js
 * var Engine = require('engine');
 * var engine = new Engine();
 * ```
 *
 * @param {Object} `options`
 * @api public
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
  this.create('partial', 'partials', { isPartial: true });
  this.create('layout', 'layouts', { isLayout: true });
  this.create('page', 'pages', { isRenderable: true });
};

/**
 * Default loader for loading templates.
 */

Engine.prototype.load = function() {
  var Loader = require('load-templates');
  var loader = new Loader(this.options);
  return loader.load.apply(loader, arguments);
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

  Engine.prototype[type] = function (key, value, locals, options) {
    return this[plural].apply(this, arguments);
  };

  Engine.prototype[plural] = function (key, value, locals, options) {
    extend(this.views[plural], this.load.apply(this, arguments));
  };

  return this;
};

function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}
