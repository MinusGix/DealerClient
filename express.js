(async () => {
const WebSocket = require('ws');
const fs = require('fs');

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
		if (args.text.startsWith('R:')) {
			let id = args.text.substring(2);
			id = id.substring(0, id.indexOf(':'));

			if (listeners.hasOwnProperty(id) && typeof(listeners[id]) === 'function') {
				listeners[id](args.text.substring(2 + id.length + 1), id, args);
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