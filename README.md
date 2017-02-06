# Mímr
Mímr (_[from the norse god Mímir](https://en.wikipedia.org/wiki/M%C3%ADmir)_) is a NodeJS script to track and mail changes of specific elements on a web-site using CSS selectors.

## Installation

This script requires `node`>= 6, `npm` and [`yarn`(secure npm alternative)](https://yarnpkg.com/). You have to clone this repository, because the package is not yet available in the npm registry.

```bash
$ git clone https://github.com/eppfel/mimr.git
```

Inside the folder you install all dependecies with:

```bash
$ yarn install
```

## Usage

### Run with `Node`

You can execute this script directly with node by calling `index.js` :

```bash
$ node index.js
```

All results will be stored in `store.json`, so, if you call the script again, it will only show you new findings.

But first you need to configure a config file:

#### Configuration in `config.json`

The script tracks page elements specified in the `config.json` in the `pages` array:
```JSON
{
  "pages": [{
    "name": "Github Trending Repositories",
    "url": "https://github.com/trending",
    "selector": ".explore-content h3 a"
  }]
}
```

Each page needs the following parameters:

Parameter | Value
----------|------
name      | a name for each page (completely free)
url       | an url to an html page to be tracked
selector  | a CSS selector to retrieve a set of elements from the page

Additionally you can specifiy mail credentials to send the results via mail. Just leave the mail setting, if you do not want to use it.

```JSON
{
  "mail": {
    "host": "smtp.example.org",
    "username": "mail@example.org",
    "password": "***",
    "from": "mail@example.org",
    "to": "mail@example.org"
	}
}
```
Mimir uses [nodemailer](https://github.com/nodemailer/nodemailer). See their [documentation](https://community.nodemailer.com/) for more details on the parameters.

##### You'll find an example configuration in `config.example.json`.

### Use as module

Include it in your projects folder or in your `node_modules` folder to import it via `require()`.

```JS
const mimr = require('./mimr')

const pages = [{"name": "Github Trending Repositories", "url": "https://github.com/trending", "selector": ".explore-content h3 a"}]
const oldFindings = []

mimr(pages, oldFindings).then(([err, newFindings, allFindings]) => {
  for (let page of newFindings) {
    console.log(page.finds)
  }
}).catch(console.error)
```

`mimr` takes an array with pages to track (see configuration) and optionally findings from a previous run to compare against.

It returns a promise that resolves an array with three elements:
- `err`: If some errors occur during extraction this will not directly break execution
- `allFindings`: These are all findings for each page provided, with an added attribute `finds`, which as an array of Strings or Objects with of found elements.
- `newFindings`: These are the findings for each page provided as `allFindings` minus the elements provided by `oldFindings`.

## Roadmap

* Impliment this as a service with internal scheduling to support features like a results web server or RSS Feed
* More comprehensive results with
    - extracting any HTML attributes
    - define custom templates for your findings
* Tests
* Browserify – to use from directly in the browser or a browser extension
