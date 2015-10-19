# event-notify

*event-notify* is a server side utility for querying the *Eventbrite* user API for a list of attendess from owned events, then notifying the user prior to the start of the event via SMS utilizing the *Twilio* API.

Currently, *event-notify* is set up to pull the "answer" element (in this case, a cell phone number) from a custom question that is added to the *Eventbrite* event ticket order form. 

Currently, users will need to set up an app in their Eventbrite settings to obtain a Personal OAuth token, and will need the Account SID and Authorization Token from their Twilio developer account.

## Usage

Authorization information should be added to the *config/configVars.sample* file and the extension for the file should be changed to *.json*.

A call to the */notify* path in a browser window will trigger a GET request to *Eventbrite*, parse the returned events, trigger another GET request for the event attendees list and send SMS messages to these attendees (if they've answered with a cell phone number on the custom question).

## To Do

+ ~~Filter out invalid phone numbers.~~
+ ~~Personalize messages utilizing data retrieved from the API.~~
+ ~~Add event information and event url to SMS message.~~
+ Convert to a cron job that only sends one message per attendee at a specified time prior to the start of the event.
