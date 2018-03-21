module.exports = {
	init: (Data) => {
		Data.app.get('/google', (req, res) => {
			let searchQuery = req.query.query;

			// it doesn't exist, so show a page to google from.
			if (typeof(searchQuery) !== 'string') {
				return res.render('google.ejs', {});
			}

			Data.request("googlesearch " + req.query.query, data => {
				res.render("google.ejs", {
					links: data
				});
			});
		});
	}
};