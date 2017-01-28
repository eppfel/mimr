const mailer	= require('nodemailer')

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
		let jobs = page.finds.join('</li><li>')
		list += `<li><a href="${page.url}">${page.name}</a><ul><li>${jobs}</li></ul></li>`
		message += `${page.name}: ${page.url} \n`
		message += page.finds.join() + '\n'
	}
	let body = `<h1>I found something:</h1><ul>${list}</ul>`
	if (transporter) {
		transporter.sendMail({
			from: config.mail.from,
			to: config.mail.to,
			subject: 'New findings from your webpage change tracker',
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
