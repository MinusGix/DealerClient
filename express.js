(async () => {
const WebSocket = require('ws');
const fs = require('fs');

const express = require('express');
const app = express();


app.set('view engine', 'ejs');

let Data = {
	express,
	app,
	WebSocket,
	Modules: {},
	files: []
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

	let res = mod.init(Data);

	if (res instanceof Promise) {
		await res;
	}
}


app.listen(616, () => console.log('Express listening on port 616'));

})(); //bleh