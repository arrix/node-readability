var http = require('http'),
    url_mod = require('url'),
    fs = require('fs');
    
var readability = require('../lib/readability-module.js');

function cleanFile(path, cb) {
    var content = fs.readFileSync(path, 'utf-8');
    readability.parse(content, cb);
}

cleanFile('test/nytime.html', function(info) {
    //console.log(info.content);
});


