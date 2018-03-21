module.exports = {
	init: (Data) => {
		Data.app.get('/stackexchange/question/:answerID', (req, res) => {
			Data.request('getstackexchangequestion&answers ' + req.params.answerID, data => {
				let question = {
					comments: data.comments || [],
					link: data.link,
					title: data.title,
					body: data.body,
					score: data.score
				};
				let answers = data.answers.map(answer => {
					return {
						score: answer.score || 0,
						body: answer.body || '',
						comments: (answer.comments || []),
						accepted: answer.is_accepted || false
					};
				});

				res.render('stackexchange.ejs', {
					answers,
					question
				});
			});
		});
		
		Data.app.get('/stackexchange/question/answers/:questionID', (req, res) => {
			Data.request("getstackexchangeanswers " + req.params.questionID, data => {
				let answers = data.map(answer => {
					let body = answer.body;
					let accepted = answer.is_accepted;

					return {
						score: answer.score || 0,
						body: answer.body || '',
						comments: (answer.comments || []),
						accepted: answer.is_accepted || false
					}
				})
				res.render("stackexchange.ejs",{
					answers
				});
			});
		});
	}
};