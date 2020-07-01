'use strict'

const fs = require("fs");
const session_generator = require("./index.js");
const http = require('https');
const getopts = require("getopts")

const options = getopts(process.argv.slice(2), {
	alias: {
		help: "h",
		"session-url": "",
	},
	default: {
		"session-url": "",
	}
});

function help() {
	console.log("usage: node cli.js --session-url=SESSION_URL");
	process.exit(0);
}

if (options.help || process.argv.length == 2) {
	help();
}

if (!options["session-url"]) {
	help();
}

const request = http.get(options["session-url"], function(res) {
	let body = "";
	res.on("data", (chunk) => body += chunk);
	res.on("end", () => {
		const json = JSON.parse(body);
		const sessionData = json.session;
		sessionData.options = "";

		// console.dir(sessionData);

		session_generator.generateAppiumIndexJs("url.json", sessionData).then((response) => {
			console.log(response);
		});
	});
});

