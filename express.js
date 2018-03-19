(async () => {
const WebSocket = require('ws');
const fs = require('fs');
const lzstring = require('lz-string');

const express = require('express');
const app = express();

app.set('view engine', 'ejs');

let listeners = {}; // stores the callbacks for certain ids

const Client = new WebSocket("wss://hack.chat/chat-ws");

Client.on('open', () => {
	console.log("Socket open");
	send({
		cmd: 'join',
		nick: 'DealerClient#communism',
		channel: "botDev"
	});
});

Client.on('message', message => {
	let args = JSON.parse(message);

	console.log(args);

	if (args.cmd === 'chat' && args.nick === 'Transferance' && args.trip === 'Wmwp0R') {
		let responseCompression = args.text.substring(1, 2); // C | U
		let responseType = args.text.substring(2, 3); // J | T

		if ((responseCompression === 'U' || responseCompression === 'C') && (responseType === 'J' || responseType === 'T')) {
			let id = args.text.substring(4);
			id = id.substring(0, id.indexOf(':'));

			let text = args.text.substring(4 + id.length + 1) // get everything after RCJ:<id>:


			if (responseCompression === 'C') { // if the response is compressed
				text = lzstring.decompressFromUTF16(text);
			}

			if (responseType === 'J') {
				text = JSON.parse(text);
			}

			if (listeners.hasOwnProperty(id) && typeof(listeners[id]) === 'function') {
				listeners[id](text, id, args);
			}
		}
	}
});

function send (data) {
	if (Client.readyState === Client.OPEN) {
		Client.send(JSON.stringify(data));
	}
}

function sendText (text) {
	send({
		cmd: 'chat',
		text
	});
}

function request (text, callback) {
	let id = generateID();

	listeners[id] = callback;

	sendText("REQUEST:" + id + ":" + text);
}

function generateID () {
	return Math.random().toString().substring(3, 9);
}




let Data = {
	express,
	app,
	WebSocket,
	Modules: {},
	files: [],

	send,
	request
};

try {
	Data.files = await (new Promise((resolve, reject) => fs.readdir("./modules/", (err, files) => {
		if (err) {
			return reject(err);
		}
		resolve(files);
	})));
} catch (err) {
	throw err;
}

for (let i = 0; i < Data.files.length; i++) {
	let mod = require('./modules/' + Data.files[i]);

	Data.Modules[mod.name || Data.files[i]] = mod;

	if (typeof(mod.init) === 'function') {
		let res = mod.init(Data);

		if (res instanceof Promise) {
			await res;
		}
	}
}


app.listen(616, () => console.log('Express listening on port 616'));

})(); //bleh