// jsdom bug: Live NodeList isn't updated after DOM manipulation
// node.js v0.2.4
// jsdom@0.1.20
// https://github.com/tmpvar/jsdom/issues/#issue/77

var jsdom = require('jsdom');
var html = '<html><body>&nbsp;<p id="p1"></p><p id="p2"></p></body></html>';
var window = jsdom.jsdom(html).createWindow();
var document = window.document;

var all = document.getElementsByTagName('*');
var i = 2;
var node = all[i];
console.log(''+node); //P#p1
node.parentNode.removeChild(node);

console.log(''+all[i]); //still P#p1. the live NodeList wasn't updated properly
all.length; //trigger a refresh. the length getter calls update()
console.log(''+all[i]); //P#p2 OK


// innerHTML = '' doesn't removed all children
// https://github.com/tmpvar/jsdom/issues/#issue/80
(function() {
  var jsdom = require('jsdom');
  var html = '<html><body><p id="p1"></p><p id="p2"></p></body></html>';
  var doc = jsdom.jsdom(html);
  var win = doc.createWindow();
  var b = doc.body;
  b.innerHTML = '';
  console.log(b.innerHTML); //<p id="p2"></p>

  var arr = [0, 1, 2, 3, 4, 5];
  arr.forEach(function(v, i) {
  	console.log('[', i, '] ==', v);
  	arr.splice(i, 1);
  });
  // output
  // [ 0 ] == 0
  // [ 1 ] == 2
  // [ 2 ] == 4

})();
