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
