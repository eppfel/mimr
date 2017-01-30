const jsdom = require('jsdom')
const url = require('url')

module.exports = function extract(pages, store = []) {
	let update = []
	let delta = []
	let requests = []

	for (let page of pages) {
		let storedPage = store.find((aStoredPage) => page.url === aStoredPage.url && page.selector === aStoredPage.selector)
		requests.push(new Promise((resolve) => {
			jsdom.env(
				page.url,
				function (err, window) {
					if (err) {
						return resolve(err)
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

	return new Promise((resolve, reject) => {
		Promise.all(requests).then((errors) => {
			errors = errors.filter(response => response !== undefined)
			resolve([errors, update, delta])
		})
		.catch(reject)
	})
}
