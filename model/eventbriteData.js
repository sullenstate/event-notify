var EventbriteObject = function(eventID, eventName, eventStartTime, eventStatus){
	this.eventID 		= eventID;
	this.eventName 		= eventName;
	this.eventStartTime	= eventStartTime;
	this.eventStatus	= eventStatus;
};

module.exports = EventbriteObject;