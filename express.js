(async () => {
const WebSocket = require('ws');
const fs = require('fs');
const lzstring = require('lz-string');

const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.use('/static/css/', express.static('views/css'));
app.use('/static/js/', express.static('views/js'));

let listeners = {}; // stores the callbacks for certain ids

let connectorName = 'hackchat'; //todo: put this in a config

try {
	Connector = require(__dirname + "/connectors/" + connectorName);
} catch (err) {
	throw err;
}

await Connector.init(WebSocket, {
	creceive () {
		return this.receive.bind(this);
	},
	async receive (data) {
		let i = 0;
		
		if (typeof(Connector.parseData) === 'function') { // run the function on the data, assume the data is fine by itself if the function doesn't exist
			data = await Connector.parseData(data);
		}
		
		if (typeof(Connector.dataShouldBeUsed) === 'function') { // run the function on the data, assume the data is fine if it doesn't exist
			if (!(await Connector.dataShouldBeUsed(data))) {
				return; // data is not to be used for anything, rip
			}
		}

		let text = data; // assume data is fine as text if the function doesn't exist

		if (typeof(Connector.grabText) === 'function') {
			text = await Connector.grabText(data);
		}

		let responseCompression = text.substring(1, 2); // C | U
		let responseType = text.substring(2, 3); // J | T
		
		if ((responseCompression === 'U' || responseCompression === 'C') && (responseType === 'J' || responseType === 'T')) {
			let id = text.substring(4);
			id = id.substring(0, id.indexOf(':'));
			
			text = text.substring(4 + id.length + 1) // get everything after RCJ:<id>:
	
	
			if (responseCompression === 'C') { // if the response is compressed
				text = lzstring.decompressFromUTF16(text);
			}
	
			if (responseType === 'J') {
				text = JSON.parse(text);
			}
			
			if (listeners.hasOwnProperty(id) && typeof(listeners[id]) === 'function') {
				listeners[id](text, id, data);
			}
		}
	}
});

function sendText (text) {
	if (typeof(Connector.sendText) === 'function') {
		Connector.sendText(text);
	}
}

function send (...data) {
	sendText(...data);
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

	send: sendText,
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

Connector.connect();

app.listen(616, () => console.log('Express listening on port 616'));

})(); //bleh