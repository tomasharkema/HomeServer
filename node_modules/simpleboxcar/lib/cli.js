#!/usr/bin/env node
var argv = require("optimist")
	.demand(["k", "s", "m", "f"])
	.describe("k", "Api key")
	.describe("s", "Secret key")
	.describe("m", "Message")
	.describe("u", "URL")
	.describe("b", "Broadcast")
	.describe("t", "To email")
	.describe("f", "From")
	.usage("Usage: $0 -k [apikey] -s [secret] -m [message] -u [url] -b -t [to]")
	.argv;

var simpleboxcar = require("./boxcar");
var boxcar = new simpleboxcar(argv.k, argv.s);

if (argv.b) {
	var opts = {
		message: argv.m,
		from: argv.f,
		url: argv.u
	};
	boxcar.broadcast(opts, function(err) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log("Success!");
		process.exit(0);
	});
} else if (argv.t) {
	var opts = {
		message: argv.m,
		from: argv.f,
		url: argv.u,
		email: argv.t
	};
	boxcar.send(opts, function(err) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log("Success!");
		process.exit(0);
	});
} else {
	error("Invalid arguments");
}