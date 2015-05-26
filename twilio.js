var https = require('https');
var qs = require('querystring');

var api = 'AC23a1cb8cfa50c074ef2b1e734db0ce1b';
var auth = '9436917844249ca9c4300a55c07c8fd3';


function sendInsights() {
	var postdata = qs.stringify({
		'From' : '+12059286746',
		'To' : '+917259981090',
		'Url' : 'http://crm-2.mybluemix.net/',
		'Body' : 'Hey mothafucka',
		'Record' : 'true'
	});
	var options = {
		host: 'api.twilio.com',
		path: '/2010-04-01/Accounts/AC23a1cb8cfa50c074ef2b1e734db0ce1b/Calls.xml',
		port: 443,
		method: 'POST',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length' : postdata.length
		},
		auth: api + ':' + auth
	};

	var request = https.request(options, function(res){
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			console.log('Response: ' + chunk);
		});
	});

	request.write(postdata);
	request.end();
};
var twilioAPI = {
	parse:sendInsights
};

module.exports = twilioAPI;
