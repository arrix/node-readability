var http = require('http'),
    url_mod = require('url'),
    fs = require('fs');
        
var readability = require('../lib/readability.js'),
    sprintf = readability.sprintf;

function cleanFile(path, url, cb) {
    var content = fs.readFileSync(path, 'utf-8');
    readability.parse(content, url, {removeReadabilityArtifacts: false, removeClassNames: false, debug: true, profile: 1}, cb);
}
if (1) {
 cleanFile(__dirname + '/weird-pages/w3c-css-no-closing-head.html', '', function(info) {
     //console.log(info.content);
 });
 
 return;
}

function batch_run() {
    var dir = __dirname + '/pages/';
    var files = fs.readdirSync(dir);
    var results = [];
    //files.length = 10;
    files.forEach(function(f) {
		if (!/\.html/i.test(f)) return;
        console.log('######## Processing file...', f);
        cleanFile(dir + f, '', function(result) {
            results.push({time: result.time, file: f, inputLength: result.inputLength, error: result.error});
        });
    });
    
    var total = 0, totalTime = 0;
    results.filter(function(v) {return !v.error}).sort(function(a, b) {return a.time - b.time;}).forEach(function(r) {
        total++;
        totalTime += r.time;
        console.log(sprintf('%5.2f\t%8d\t%10s', r.time, r.inputLength, r.file));
    });
    console.log('total:', total, "avg time:", totalTime/total);
}

batch_run();
