exports.parse = parse;
var jsdom = require('jsdom');
var rdom = require('./readability-my2.js');
var util = require('util');

function parse(html, url, callback) {
    //util.debug(html);
    var doc = jsdom.jsdom(html, null, {url: url});
    util.log('---DOM created');
    var win = doc.parentWindow;
    if (!doc.body) {
        console.log('empty body');
        return callback({title: '', content: ''});
    }
    
    rdom.start(win, function(html) {
        //console.log(html);
        callback({title: document.title, content: html});
    });
}