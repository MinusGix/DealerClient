module.exports = {
	init: (Data) => {
		Data.app.get('/', (req, res) => res.render('test.ejs', { text: "No u <3 " + Math.random() }));
	}
};