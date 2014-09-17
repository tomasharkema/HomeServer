var request = require("request");
var uuid = require("node-uuid"); // To be used

// SimpleBoxcar constructor

SimpleBoxcar = function(apikey, apisecret) {
	this.baseurl = "https://boxcar.io/devices/providers/" + apikey + "/";
	this.secret = apisecret;
}

// Subscribe someone to boxcar channel

SimpleBoxcar.prototype.subscribe = function (email, cb) {
	var self = this;
	console.assert(email);
	
	request.post(self.baseurl + "notifications/subscribe", {json: { email: email } }, cb);
}

// Send a message to someone/people
//           name     type                                     example
// required: message: string message                         : Test message
// required: email  : string email OR emails: array of emails: example@example.com || [1@1.com, 2@2.com]
// required: from   : string name                            : MyAwesomeApp
// optional: url    : string url                             : http://nodejs.org

SimpleBoxcar.prototype.send = function (opt, cb) {
	var self = this;
	console.assert(opt);
	console.assert(opt.message);
	console.assert(opt.email || opt.emails);
	console.assert(opt.from);
	
	opt.notification = {
		message: opt.message,
		from_screen_name: opt.from,
		source_url: opt.url,
		from_remote_service_id: Math.floor(Math.random() * 100000000000000000)
	};
	
	
	request.post(self.baseurl + "notifications", {json: opt}, cb);
}

// Send a message to all subscribers
//           name     type                                     example
// required: message: string message                         : Test message
// required: from   : string name                            : MyAwesomeApp
// optional: url    : string url                             : http://nodejs.org
SimpleBoxcar.prototype.broadcast = function (opt, cb) {
	var self = this;
	console.assert(opt);
	console.assert(opt.message);
	console.assert(opt.from);
	
	opt.notification = {
		message: opt.message,
		from_screen_name: opt.from,
		source_url: opt.url,
		from_remote_service_id: Math.floor(Math.random() * 100000000000000000)
	};
	opt.secret = self.secret;
	
	request.post(self.baseurl + "notifications/broadcast", {json: opt}, cb);
}

module.exports = SimpleBoxcar;
