var https = require('https');
var twilio = require('twilio');

// Load Configuration Keys
var configVars = require('../config/configVars.json');


var indexController = {
	index: function(req, res) {
		res.render('index');
	},
	events: function(req, res) {
		var options = {
			host: 'www.eventbriteapi.com',
			path: '/v3/users/me/owned_event_attendees/?token=' + configVars.eventbriteToken
		};
		var client = twilio( configVars.twilioSID, configVars.twilioAuthToken );
		var req = https.get(options, function(res) {
  			// console.log('STATUS: ' + res.statusCode);
  			// console.log('HEADERS: ' + JSON.stringify(res.headers));
			var bodyChunks = [];
			res.on('data', function(chunk) {
				bodyChunks.push(chunk);
			}).on('end', function() {
				var body = Buffer.concat(bodyChunks);
				
				var removeDash = function(val){
					return val != '-'
				};

				var toNumber = JSON.parse(body)['attendees'][1]['answers'][0]['answer'].split('').filter(removeDash).join('');
				client.sendMessage( { to: '+1' + toNumber, from:'+17208975209', body:'Hello ' + JSON.parse(body)['attendees'][1]['profile']['first_name'] + ' - This is a reminder that you have tickets to a Regenxx seminar later today!' }, function( err, data ) {
					console.log(err);
				});
				
				console.log('+1' + toNumber);
				console.log( JSON.parse(body)['attendees'][1]['profile']['first_name'] );
				console.log( JSON.parse(body)['attendees'][1]['answers'][0]['answer'] );
				// console.log(JSON.parse(body));
			})
		});

		req.on('error', function(e) {
  			console.log('ERROR: ' + e.message);
		});

		res.sendStatus('200');
	}
};

module.exports = indexController;