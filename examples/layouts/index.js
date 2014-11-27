'use strict';

var util = require('util');
var Options = require('option-cache');
var layouts = require('layouts');
var _ = require('lodash');
var extend = _.extend;

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
  Options.call(this, options);
  this.views = {};
  this.defaultTemplates();
  this.defaultOptions();

  if (this.enabled('debug')) {
    this.debug();
  }
}

util.inherits(Engine, Options);

/**
 * Add some default template "types"
 */

Engine.prototype.defaultOptions = function () {
  this.option('delims', {
    content: ['<%', '%>'],
    // any of these will work
    // layout: /\{%([\s\S]+?)%}/g,
    // layout: '{%([\\s\\S]+?)%}',
    layout: ['{%', '%}'],
  });
  this.disable('debug');
};

/**
 * Default debugging settings
 */

Engine.prototype.debug = function () {
  this.enable('debugLayouts');
  this.enable('debugEngines');
};

/**
 * Add some default template "types"
 */

Engine.prototype.defaultTemplates = function () {
  this.create('page', 'pages', { isRenderable: true , delims: {layout: ['<%', '%>']}});
  this.create('partial', 'partials', { isPartial: true });
  this.create('layout', 'layouts', { isLayout: true });
};

/**
 * Normalize values and return a template object.
 *
 * @param {String} `key`
 * @param {Object} `value`
 * @param {Object} `locals`
 * @param {Object} `options`
 * @return {Object}
 * @api private
 */

Engine.prototype.load = function (key, value, locals, options) {
  if (typeof value === 'string') {
    value = {content: value};
  }

  var o = value || {};
  o.locals = locals || {};
  o.options = _.extend({}, options);
  o.layout = o.layout || o.locals.layout || o.options.layout;
  return o;
};

/**
 * Given an object of `layouts`, and the `name` of a starting layout,
 * build the layout stack for the given `string`, then wrap and return
 * the string.
 *
 * @param {String} `str` The content string that should be wrapped with a layout.
 * @param {String} `name` The name of the layout to use.
 * @param {Object} `layouts` Object of layouts. `name` should be a key on this object.
 * @return {String} Returns the original string, wrapped with a layout, or layout stack.
 * @api public
 */

Engine.prototype.applyLayout = function (name, collection) {
  var template = this.views[collection][name];
  name = name || template.layout || template.locals.layout;

  // generate delimiters to use for layouts
  var opts = extend({}, this.options, template.options);
  opts.delims = opts.delims && opts.delims.layout;

  return layouts(template.content, name, this.views.layouts, opts);
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

  Engine.prototype[type] = function (key, value, locals, opt) {
    return this[plural].apply(this, arguments);
  };

  Engine.prototype[plural] = function (key, value, locals, opt) {
    this.views[plural][key] = this.load.apply(this, arguments);
    return this;
  };
  return this;
};
