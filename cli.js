#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const extract = require('./extract')

//load configuration
const config = require('./config')

// load previous results
const storeFile = path.join(__dirname,  'store.json')
let store
if (fs.existsSync(storeFile)) {
	store = JSON.parse(fs.readFileSync(storeFile, 'utf8'))
} else {
	store = []
}

// retrieve and extract current state of pages
extract(config.pages, store).then(([err, update, delta]) => {
	if (err.length) {
		err.forEach(console.warn)
	}

	// write current state to storage
	fs.writeFileSync(storeFile, JSON.stringify(update), {encoding: 'utf8'})

	if (!delta.length) {
		console.log('No new changes found')
	} else {
		console.log(`Changes found on ${delta.length} pages`)

		// send new findings via mail
		if (config.mail !== undefined) {
			const mailer = require('./mailer')
			mailer(config.mail, delta, (err) => {
				if (err) {
					throw err
				}
				console.log('Mail with results sent!')
			})
		}
	}
})
.catch(console.error)
