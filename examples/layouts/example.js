'use strict';

var util = require('util');
var chalk = require('chalk');
var Engine = require('./');
var engine = new Engine();

var layouts = {
  'default': {
    content: '[default]<%= body %>[default]',
    locals: {title: 'Quux'}
  },
  aaa: {
    content: '[aaa]<%= body %>[aaa]',
    locals: {title: 'Foo'},
    layout: 'bbb'
  },
  bbb: {
    content: '[bbb]<%= body %>[bbb]',
    locals: {title: 'Bar'},
    layout: 'ccc'
  },
  ccc: {
    content: '[ccc]<%= body %>[ccc]',
    locals: {title: 'Baz'},
    layout: 'default'
  },
  ddd: {
    content: '[ddd]<%= body %>[ddd]',
    locals: {title: 'Baz'}
  }
};

engine
  .layout('default', 'default above\n{% body %}\ndefault below', {name: 'brian woodward'})
  .layout('aaa', 'aaa above\n{% body %}\naaa below', {layout: 'bbb'})
  .layout('bbb', 'bbb above\n{% body %}\nbbb below', {layout: 'ccc'})
  .layout('ccc', 'ccc above\n{% body %}\nccc below', {layout: 'default'})
  .layout('ddd', 'ddd above\n<% body %>\nddd below', {delims: {layout: ['<%', '%>']}})
  .layout('eee', 'eee above\n{% body %}\neee below')

engine.partial('sidebar1', 'This is sidebar 1.', {layout: 'ddd'});
engine.partial('sidebar2', 'This is sidebar 2.', {layout: 'eee'});
engine.page('home', {content: 'This is content', layout: 'aaa'}, { engine: 'lodash' });
engine.page('about', {content: 'This is content', layout: 'ccc'}, { engine: 'hbs' });
engine.page('contact', {content: 'This is content', layout: 'default'}, { engine: 'hbs' });

// console.log(engine.applyLayout('home', 'pages'))
// console.log(engine.applyLayout('aaa', 'layouts'))

console.log(chalk.green('\nPartials'));

Object.keys(engine.views.partials).forEach(function(name) {
  console.log();
  console.log(engine.applyLayout(name, 'partials'));
});

console.log(chalk.green('\nPages'));

Object.keys(engine.views.pages).forEach(function(name) {
  console.log();
  console.log(engine.applyLayout(name, 'pages'));
});

console.log(chalk.green('\nLayouts'));

Object.keys(engine.views.layouts).forEach(function(name) {
  console.log();
  console.log(engine.applyLayout(name, 'layouts'));
});

console.log(util.inspect(engine, null, 10));
