module.exports = {
	name: 'hackchat',

	state: {
		config: {
			websocketURL: "wss://hack.chat/chat-ws",
			username: 'DealerClient',
			password: 'communism',
			channel: 'botDev'
		},
		ws: null,
		pingInterval: null
	},

	_WebSocket: null,
	_Util: null,

	async init (WebSocket, Util) {
		this._WebSocket = WebSocket;
		this._Util = Util;
	},

	async connect () {
		if (this.state.ws instanceof this._WebSocket) {
			await this._kill();
		}

		this.state.ws = new this._WebSocket(this.state.config.websocketURL);
		this.state.ws.on('open', this._copen());
		this.state.ws.on('message', this._Util.receive);
		// TODO: ws.on('error') and such
	},

	async kill () {
		if (typeof(this.state.pingInterval) === 'number') { // check, even though clearInterval doesn't seem to throw errors
			clearInterval(this.state.pingInterval);
		}
		this.state.pingInterval = null;

		if (this.state.ws instanceof this._WebSocket && typeof(this.state.ws.close) === 'function') {
			this.state.ws.close();
		}
		this.state.ws = null;
	},

	async parseData (data) {
		try {
			let args = JSON.parse(data);
			console.log(args);
			return args;
		} catch (err) {
			throw new Error("[ERROR] in parsing a message from the server. " + err.toString());
		}
	},

	async dataShouldBeUsed (data) {
		return typeof(data) === 'object' && typeof(data.cmd) === 'string' && data.cmd === 'chat' &&
			typeof(data.text) === 'string' && data.nick === 'Transferance';
	},

	async grabText (data) {
		return data.text || '';
	},

	// add more grabs, so it can be more customized via connector

	sendText (text) {
		this._text(text);
	},

	_ping () {
		this._send({ cmd: 'ping' });
	},

	_copen () {
		return this._open.bind(this);
	},

	_open () {
		console.log("Socket open");
		
		this._join();
		
		this.state.pingInterval = setInterval(_ => this._ping(), 50000);
	},

	_send (data) {
		if (this.state.ws instanceof this._WebSocket && this.state.ws.readyState === this.state.ws.OPEN) {
			this.state.ws.send(JSON.stringify(data));
		}
	},
	_join () {
		this._send({
			cmd: 'join',
			nick: this.state.config.username + (this.state.config.trip ? '#' + this.state.config.trip : ''),
			channel: this.state.config.channel
		});
	},
	_text (text) {
		this._send({
			cmd: 'chat',
			text
		});
	},

	_invite (nick) {
		this._send({ cmd: 'invite', nick });
	},

	_error (err) {
		console.error('[ERROR] Error in client with username of "' + this.state.config.username + '" ', err.toString());
		this.emit('hc:websocket:error', err, this);
	},

};