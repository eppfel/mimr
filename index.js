const jsdom		= require('jsdom')
const fs			= require('fs')
const mailer	= require('nodemailer')

const configFile	= './config.json'
const storeFile	= './store.json'

//load configuration
if (!fs.existsSync(configFile)) {
	console.warn('Please provide a configuration in config.json. See config.example.json for a template.')
	process.exit()
}
const config	= JSON.parse(fs.readFileSync(configFile, 'utf8'))

// load previous results
let store
if (fs.existsSync(storeFile)) {
	store = JSON.parse(fs.readFileSync(storeFile, 'utf8'))
} else {
	store = []
}

let update		= []
let delta			= []
let requests	= []

for (let page of config.pages) {
	let storedPage = store.find((aStoredPage) => page.url === aStoredPage.url && page.selector === aStoredPage.selector)
	requests.push(new Promise((resolve, reject) => {
		jsdom.env(
			page.url,
			function (err, window) {
				if (err) {
					console.warn(err)
					return resolve()
				}
				page.finds = []
				for (element of window.document.querySelectorAll(page.selector)) {
					page.finds.push(element.innerHTML)
				}
				update.push(Object.assign({},page))
				if (storedPage !== undefined && storedPage.finds !== undefined) {
					page.finds = page.finds.filter(extract => storedPage.finds.indexOf(extract) === -1)
				}
				if (page.finds.length) {
					delta.push(page)
				}
				resolve()
			}
		)
	}))
}

Promise.all(requests).then(() => {
	fs.writeFileSync(storeFile, JSON.stringify(update), {encoding: 'utf8'})

	if (!delta.length) {
		console.log('No new changes found')
	} else {
		console.log(delta)

		if (config.mail !== undefined) {
			const mailer = require('./mailer.js')
			mailer(config, delta)
		}
	}
})
.catch(console.error)
