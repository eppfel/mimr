const mailer = require('nodemailer')

module.exports = function sendResultsPerMail (config, findings) {
	var transporter = mailer.createTransport({
		host: config.mail.host,
		secure: true,
		auth: {
			user: config.mail.username,
			pass: config.mail.password
		}
	})

	let message = 'I found something:\n'
	let list = ''
	for (let page of findings) {
		let finds = page.finds.join('</li>\n<li>')
		list += `<section>\n<h2><a href="${page.url}">${page.name}</a></h2>\n<ul>\n<li>${finds}</li>\n</ul>\n</section>`
		message += `${page.name}: ${page.url} \n`
		message += page.finds.join(',\n') + '\n\n'
	}
	let body = `<h1>Mímir found some changes:</h1>\n${list}`
	if (transporter) {
		transporter.sendMail({
			from: config.mail.from,
			to: config.mail.to,
			subject: `Mímir found changes on ${findings.length} pages`,
			text: message,
			html: body
		}, (err) => {
			if (err) {
				throw err
			}
			console.log('Mail with results sent!')
		})
	}
}
