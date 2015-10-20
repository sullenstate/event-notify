var https = require('https');
var twilio = require('twilio');
var eventbriteData = require('../model/eventbriteData.js');

// Load Configuration Keys
var configVars = require('../config/configVars.json');

var apiController = {
	notify : function (req, res) {
		var options = {
			host: 'www.eventbriteapi.com',
			path: '/v3/users/me/owned_events/',
			headers : {"Authorization": "Bearer " + configVars.eventbriteToken }
		};

		var events = [];

		// GET Events List
		var req = https.get(options, function(res) {

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

					// Create an object for this event and push to events array - Not currently used 
					var eventbriteOject = new eventbriteData(eventID, eventName, eventStartTime, eventStatus);
					events.push(eventbriteOject);

					// Reset API path for followup GET request
					options.path = '/v3/events/' + eventID + '/attendees/';
					
					var client = twilio( configVars.twilioSID, configVars.twilioAuthToken );
					
					// Followup GET request to retrieve event[i] attendees
					var req2 = https.get(options, function(res) {

						var req2BodyChunks = [];

						res.on('data', function(chunk) {
							req2BodyChunks.push(chunk);
						}).on('end', function() {

							var req2Body = Buffer.concat(req2BodyChunks);

							// Function to remove extraneous characters from entered phone number
							var removeGarbage = function(val){
								if (val.charCodeAt() > 47 && val.charCodeAt() < 58) {
									return val;
								};
							};
						
							var toNumbers = [];

							for (var i = 0; i < JSON.parse(req2Body)['attendees'].length; i++) {
								if (JSON.parse(req2Body)['attendees'][i]['answers'][0]['answer']) {

									var recipient = {};

									recipient.name = JSON.parse(req2Body)['attendees'][i]['profile']['first_name'];
									recipient.phone = JSON.parse(req2Body)['attendees'][i]['answers'][0]['answer'].split('').filter(removeGarbage).join('');
									recipient.eventID = JSON.parse(req2Body)['attendees'][i]['event_id'];

									toNumbers.push(recipient);
								};
							};

							// console.log(toNumbers);

							for (var i = 0; i < toNumbers.length; i++) {

								var toNumber = toNumbers[i].phone;

								if (toNumber.length === 10) {

									var message = 'Hello ' + toNumbers[i].name + configVars.messageBody + '"' + eventName + '". For further information, please visit: https://www.eventbrite.com/event/' + toNumbers[i].eventID;

									// console.log(message);
									
									client.sendMessage( { to: '+1' + toNumber, from: configVars.fromNumber, body: message }, function( err, data ) {
										if (err) {
											console.log(err);
										};
									});
								};
							};
						});
					});
					req2.on('error', function(e) {
  						console.log('ERROR: ' + e.message);
					});
				};
				// console.log(options);
				// console.log(events);
			});
		});
		req.on('error', function(e) {
  			console.log('ERROR: ' + e.message);
		});
		res.sendStatus(res.statusCode);
	}
}

module.exports = apiController;
