const jsdom = require('jsdom')
const fs = require('fs')

//load configuration
const config = require('./config')

// load previous results
const storeFile = './store.json'
let store
if (fs.existsSync(storeFile)) {
	store = JSON.parse(fs.readFileSync(storeFile, 'utf8'))
} else {
	store = []
}

let update = []
let delta = []
let requests = []

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

				// record current state with selector
				page.finds = []
				for (element of window.document.querySelectorAll(page.selector)) {
					page.finds.push(element.innerHTML)
				}
				update.push(Object.assign({},page))

				// check for new results
				if (storedPage !== undefined && storedPage.finds !== undefined && storedPage.finds.length && page.finds.length) {
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
			const mailer = require('./mailer')
			mailer(config, delta)
		}
	}
})
.catch(console.error)
