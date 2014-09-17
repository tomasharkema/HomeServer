simpleboxcar
============

A simple boxcar api for node.js

Usage:

Creating an instance
	
	var simpleboxcar = require("simpleboxcar");
	var boxcar = new simpleboxcar("apikey", "apisecret");

Subscribing users
	
	boxcar.subscribe("email", function(err, res) {
		if (err) {
			console.log("Error: " + err);
			return;
		}
		console.log("Subscribed!");
	});

Sending notifications
	
	var opts = {
		message: "Test message",
		email: "example@example.com", // or emails: ["emails"]
		from: "MyAwesomeApp",
		url: "http://nodejs.org" // Optional
	};
	
	boxcar.send(opts, function(err, res) {
		if (err) {
			console.log("Error: " + err);
			return;
		}
		console.log("Sent!");
	});

Broadcasting notifications
	
	var opts = {
		message: "Test message",
		from: "MyAwesomeApp",
		url: "http://nodejs.org" // Optional
	};
	
	boxcar.broadcast(opts, function(err, res) {
		if (err) {
			console.log("Error: " + err);
			return;
		}
		console.log("Broadcasted!");
	});

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/Sxw1212/simpleboxcar/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

