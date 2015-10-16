var https = require('https');
var twilio = require('twilio');
var eventbriteData = require('../model/eventbriteData.js');

// Load Configuration Keys
var configVars = require('../config/configVars.json');

var apiController = {
	attendees: function(req, res) {
		var options = {
			host: 'www.eventbriteapi.com',
			path: '/v3/users/me/owned_event_attendees/',
			headers : {"Authorization": "Bearer " + configVars.eventbriteToken }
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
				
				// Function to remove extraneous characters
				var removeGarbage = function(val){
					if (val.charCodeAt() > 47 && val.charCodeAt() < 58) {
						return val;
					};
				};

				var toNumbers = [];

				for (var i = 0; i < JSON.parse(body)['attendees'].length; i++) {
					if (JSON.parse(body)['attendees'][i]['answers'][0]['answer']) {
						toNumbers.push(JSON.parse(body)['attendees'][i]['profile']['first_name']);
						toNumbers.push(JSON.parse(body)['attendees'][i]['answers'][0]['answer'].split('').filter(removeGarbage).join(''));
					};
				};
				console.log(toNumbers);

				for (var i = 1; i < toNumbers.length; i += 2) {
					var toNumber = toNumbers[i];

					if (toNumber.length === 10) {

						console.log('Hello ' + toNumbers[i-1] + configVars.messageBody);
						
						client.sendMessage( { to: '+1' + toNumber, from: configVars.fromNumber, body: 'Hello ' + toNumbers[i-1] + configVars.messageBody }, function( err, data ) {
							// console.log('+1' + toNumber);
							console.log(err);
						});
					};
				};
				
				// console.log( JSON.parse(body)['attendees'][1]['profile']['first_name'] );
				// console.log(JSON.parse(body));
			})
		});

		req.on('error', function(e) {
  			console.log('ERROR: ' + e.message);
		});

		res.sendStatus('200');
	},
	events : function (req, res) {
		var options = {
			host: 'www.eventbriteapi.com',
			path: '/v3/users/me/owned_events/',
			headers : {"Authorization": "Bearer " + configVars.eventbriteToken }
		};

		var events = [];

		var req = https.request(options, function(res) {

			var bodyChunks = [];
			
			res.on('data', function(chunk) {
				bodyChunks.push(chunk);
			}).on('end', function() {
				
				var body = Buffer.concat(bodyChunks);
			
				for (var i = JSON.parse(body).events.length - 1; i >= 0; i--) {

					var eventID = JSON.parse(body).events[i].id;
					var eventName = JSON.parse(body).events[i].name.text;
					var eventStartTime = JSON.parse(body).events[i].start.utc;
					var eventStatus = JSON.parse(body).events[i].status;

					// Create an object for this event
					var eventbriteOject = new eventbriteData(eventID, eventName, eventStartTime, eventStatus);

					events.push(eventbriteOject);

					console.log(events);
				};
			});
		});

		// Pick up here... Use callback to pull attendees from event.eventID
		req.end();

		req.on('error', function(e) {
  			console.log('ERROR: ' + e.message);
		});

		res.sendStatus(res.statusCode);
	}
}

module.exports = apiController;
