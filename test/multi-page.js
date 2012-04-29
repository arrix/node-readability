var readability = require('../lib/readability'),
	request = require('request'),
	encoding = 'utf8';
var url = "http://www.washingtonpost.com/world/national-security/manhunt-details-us-mission-to-find-osama-bin-laden/2012/04/27/gIQAz5pLoT_story.html";


request({url:url, 'encoding':'binary'}, function (error, response, html) {
	if(response['headers']['content-type']) {
		var content_type = response['headers']['content-type'].split('=');
		if(content_type.length == 2) encoding = content_type[1].toUpperCase();
	}
  	if(!error && response.statusCode == 200) {
  	  	readability.parse(html, url, {encoding:encoding}, function(result) {
  	  		console.log(result.title, result.content);
		});
  	}
});