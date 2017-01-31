const expect = require('chai').expect

const http = require('http')
const host = '127.0.0.1'
const port = 4321
const html = `<!DOCTYPE html>
<html>
<head>
	<title>Testpage for Mimir</title>
</head>
<body>
<main>
<article>
	<h4>Result 1</h4>
	<a href="result1.html">Result 1</a>
</article>
<article>
	<h4>Result 2</h4>
	<a href="result2.html">Result 2</a>
</article>
<article>
	<h4>Result 3</h4>
	<a href="result3.html">Result 3</a>
</article>
</main>
</body>
</html>`

const pages = [{
	name: 'Testpage',
	url: `http://${host}:${port}/test.html`,
	selector: 'article h4'
}]

const pagesWithAnchors = [{
	name: 'Testpage',
	url: `http://${host}:${port}/test.html`,
	selector: 'article a'
}]

const results = [{
	name:'Testpage',
	url:`http://${host}:${port}/test.html`,
	selector:'article h4',
	finds:['Result 1','Result 2','Result 3']
}]

const mimir = require('../')

describe('Mimir - extract', function() {
	const server = http.createServer((req, res) => {
		res.statusCode = 200
		res.setHeader('Content-Type', 'text/HTML')
		res.end(html)
	})

	before(function () {
		server.listen(port, host)
	})

	it('Should return a list of pages with elements from an list of URLs and Selectors', function (done) {
		mimir(pages).then(([err, findings, news]) => {
			expect(err).to.be.a('array')
			expect(err).to.be.empty
			expect(findings).to.deep.equal(results)
			expect(news).to.deep.equal(findings)
			done()
		}).catch(done)
	})

	it('Should not return new elements if same as second parameter', function (done) {
		mimir(pages, results).then(([err, findings, news]) => {
			expect(err).to.be.a('array')
			expect(err).to.be.empty
			expect(findings).to.deep.equal(results)
			expect(news).to.be.empty
			done()
		}).catch(done)
	})

	it('Should return anquors as an Object with name and an absolute url', function (done) {
		mimir(pagesWithAnchors).then(([err, findings, news]) => {
			expect(err).to.be.a('array')
			expect(err).to.be.empty
			expect(findings).to.deep.equal(news)
			expect(findings).to.have.deep.property('[0].finds[0].url',`http://${host}:${port}/result1.html`)
			expect(findings).to.have.deep.property('[0].finds[0].name')
			done()
		}).catch(done)
	})

	after(function () { server.close() })
})
