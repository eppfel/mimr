const jsdom = require('jsdom')
const fs = require('fs')
const url = require('url')

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
				for (let element of window.document.querySelectorAll(page.selector)) {
					if (element.hasAttribute('href')) {
						let anchor = {name: element.innerHTML, url: url.resolve(page.url, element.getAttribute('href'))}
						page.finds.push(anchor)
					} else {
						page.finds.push(element.innerHTML)
					}
				}
				update.push(Object.assign({},page))

				// check for new results
				if (storedPage !== undefined && storedPage.finds !== undefined && storedPage.finds.length && page.finds.length) {
					page.finds = page.finds.filter(extract => {
						if (typeof extract === 'string') {
							return (storedPage.finds.indexOf(extract) === -1)
						} else if (extract.url !== undefined) {
							return (storedPage.finds.find(storedExtract => extract.url === storedExtract.url) === undefined)
						} else {
							return true
						}
					})
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
