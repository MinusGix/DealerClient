module.exports = {
	init: (Data) => {
		Data.app.get('/stackexchange/question/answers/:questionID', (req, res) => {
			Data.request("getstackexchangeanswers " + req.params.questionID, data => {
				let answers = data.map(answer => {
					let body = answer.body;
					let accepted = answer.is_accepted;
					let poster = {
						name: answer.owner.display_name,
						profileURL: answer.owner.linke
					};

					return {
						body,
						accepted,
						poster,
						score: answer.score
					};
				})
				res.render("stackexchange.ejs",{
					answers
				});
			});
		});
	}
};