var sys = require('sys'), 
    http = require('http'),
    url_mod = require('url'),
    events = require('events');
    
var util = require('util');
    
var jsdom = require('jsdom');

var readability2 = require('../lib/readability.js');
    
function extend(to, from) {
    var l,i,o,j;
    for (i = 1, l = arguments.length; i < l; i++) {
        o = arguments[i];
        for (j in o) {
            to[j] = o[j];
        }
    }
    return to;
}

http.createServer(function(req, res) {
    console.log(req.url);
    var u = url_mod.parse(req.url, true);
    
    
    var isMainDoc = u.pathname == '/';
    
    if (isMainDoc) {
        var q = u.query;
        u = (q && q.url) || 'http://en.wikipedia.org/wiki/Ruby'
        u = url_mod.parse(u);
    } else {
        res.writeHead(404);
        res.end();
        return;
    }
    
    
    var client = http.createClient(u.port || 80, u.hostname);
    var h = {host: u.hostname};
    'accept user-agent accept-language accept-charset accept-encoding'.split(' ').forEach(function(field) {
        h[field] = req.headers[field];
    });
    
    extend(h, {'pragma': 'no-cache', 'accept-encoding': 'none'});
        
    console.log(h);
    var request = client.request('GET', u.pathname + (u.search || '') + (u.hash || ''), h);
    request.end();
    
    var result = {};
    request.on('response', function(response) {
        console.log('[Response]', response.statusCode, response.headers['content-type']);
        
        var contentType = response.headers['content-type'];
        if (/html/i.test(contentType)) {
            //is html
        } else {
            console.log('NOT HTML');
            //something else
            res.writeHead(response.statusCode, response.headers);
            response.on('data', function(data) {
                res.write(data);
            });
            response.on('end', function() {
                res.end();
            });
            return;
        }
        
        response.setEncoding('utf-8');
        result.statusCode = response.statusCode;
        result.headers = response.headers;
        result.headers['content-type'] = 'text/html'; //override xhtml mimetype
        result.body = null;
        response.on('data', function(data) {
            //console.log('==========', data.constructor.name, data);
            if (result.body === null) 
                result.body = data;
            else
                result.body += data;
        });
        response.on('end', function() {
            util.debug('===== response end');
            res.writeHead(result.statusCode, result.headers);
            if (result.body !== null) {
                // var clean = new CleanReading(result.body);
                // clean.on('finish', function(info) {
                //     res.write(info.content);
                //     res.end();
                // });
                // clean.clean();
                
                readability2.parse(result.body, '', {removeReadabilityArtifacts: false, removeClassNames: false, debug: true, profile: true}, function(info) {
                    res.write(CleanReading.prototype.wrapContent(info.title, info.content));
                    res.end();
                });
            } else {
                res.end();
            }
        });
    });
}).listen(3000);

function CleanReading(html) {
    var z = this;
    events.EventEmitter.call(z);
    z.html = html;
}
CleanReading.super_ = events.EventEmitter;

CleanReading.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {value: CleanReading}
});

extend(CleanReading.prototype, {
    clean: function() {
        var z = this;
        // var w = jsdom.jsdom(z.html).createWindow();
        // var doc = w.document;
        
        readability.Client.parse(z.html, function(r) {
            console.log('====== readability ======', r.title);
            z.emit('finish', r);
            //z.emit('finish', {title: r.title, content: z.wrapContent(r.title, r.content)});
        });
        //z.emit('finish', {content: z.html});
    },
    
    wrapContent: function(title, content) {
        return '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8" /><title>' +
         title + '</title><link rel="stylesheet" href="http://lab.arc90.com/experiments/readability/css/readability.css" type="text/css" media="all" /></head><body>' +
         content +
         '</body></html>'; 
    }
});