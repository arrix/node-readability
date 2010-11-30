var request = require('request');
var jsdom = require('jsdom');

var url = 'http://www.w3.org/TR/css3-2d-transforms/';
request({uri:url}, function (error, response, body) {
    var html = body;
    var doc = jsdom.jsdom(html, null, {url: url});
    console.log(doc.head+''); //[ HEAD ]
    console.log(doc.body === null); //true
    console.log(doc.head.childNodes[9].tagName); //BODY
});

var doc = jsdom.jsdom(html, null, {url: ''});


var HTML5 = require('html5');
var fs = require('fs');
var content = fs.readFileSync('test/css.html', 'utf-8');
var html = content;
var jsdom = require('jsdom');
var browser = jsdom.browserAugmentation(jsdom.defaultLevel);

var doc = new browser.HTMLDocument();
var parser = new HTML5.Parser({document: doc});
parser.parse(html);

var doc2 = jsdom.jsdom(html, null, {parser: HTML5});




var htmlparser = require("htmlparser");
var handler = new htmlparser.DefaultHandler(function (error, dom) {

});
var parser = new htmlparser.Parser(handler);
parser.parseComplete(html);
sys.puts(sys.inspect(handler.dom, false, null));