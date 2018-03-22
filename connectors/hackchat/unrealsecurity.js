// A connector made to modify the hackchat connector
module.exports = {
	name: 'hackchat-unrealsecurity',
	async init (Util) {
		Util.Connector.state.config.websocketURL = 'wss://vps.unrealsecurity.net/chat-ws';
	}
}