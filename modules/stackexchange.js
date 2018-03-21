module.exports = {
	init: (Data) => {
		Data.app.get('/stackexchange/question/:answerID', (req, res) => {
			console.log('boo');
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
						score: data.score || 0,
						body: answer.body || '',
						comments: (answer.comments || [])
							.map(comment => comment.body),
						accepted: data.is_accepted || false
					};
				});

				res.render('stackexchange.ejs', {
					answers,
					question
				});
				console.log('hi', question, answers);
			});
		});
		
		Data.app.get('/stackexchange/question/answers/:questionID', (req, res) => {
			Data.request("getstackexchangeanswers " + req.params.questionID, data => {
				let answers = data.map(answer => {
					let body = answer.body;
					let accepted = answer.is_accepted;
					let poster = {
						name: answer.owner.display_name,
						profileURL: answer.owner.link
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