'use strict';

var Engine = require('./');
var engine = new Engine();

engine.layout('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'});
engine.layout('layouts/*.txt', {name: 'Brian Woodward'});
engine.layout('test/fixtures/a.md', {a: 'b'});

engine.page('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
engine.page('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
engine.page(['test/fixtures/one/*.md'], {a: 'b'});
engine.page({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
engine.page({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
engine.page({'test/fixtures/a.txt': {path: 'a.md', a: 'b'}});
engine.page({path: 'test/fixtures/three/a.md', foo: 'b'});
engine.pages('fixtures/two/*.md', {name: 'Brian Woodward'});
engine.pages('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'});
engine.pages('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
engine.pages('test/fixtures/a.md', {foo: 'bar'});
engine.pages('test/fixtures/three/*.md', {name: 'Brian Woodward'});
engine.pages(['test/fixtures/a.txt'], {name: 'Brian Woodward'});

engine.partial({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
engine.partial({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});

console.log(engine);
