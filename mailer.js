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

	let message = 'Mímir found these changes:\n'
	let list = ''
	for (let page of findings) {
		let finds = ''
		message += `\n\n${page.name}: ${page.url} \n`
		if (page.finds[0].url === undefined) {
			finds = page.finds.join('</li>\n<li>')
			message += page.finds.join(',\n')
		} else {
			finds = page.finds.reduce((finds, finding, index) => {
				if (index !== 0) {
					finds += '</li>\n<li>'
				}
				return `${finds}<a href="${finding.url}">${finding.name}</a>`
			}, finds)
			message = page.finds.reduce((msg, finding) => `${msg} - ${finding.name}: ${finding.url}\n`}, message)
		}
		list += `<section>\n<h2><a href="${page.url}">${page.name}</a></h2>\n<ul>\n<li>${finds}</li>\n</ul>\n</section>`
	}
	let body = `<h1>Mímir found these changes:</h1>\n<br>\n${list}`
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
