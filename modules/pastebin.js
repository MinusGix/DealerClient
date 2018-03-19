module.exports = {
	init: (Data) => {
		Data.app.get('/pastebin/:pastebinID', (req, res) => {
			Data.request("getpaste " + req.params.pastebinID, data => {
				res.render("pastebin.ejs", {
					text: data
				});
			});
		});
	}
};