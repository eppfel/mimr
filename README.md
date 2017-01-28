# Mímir
[Mímir](https://en.wikipedia.org/wiki/M%C3%ADmir) is a NodeJS script to track and mail changes of specific elements on a web-site using CSS selectors

## Installation

This script requires `node`, `npm` and [`yarn`(secure npm alternative)](https://yarnpkg.com/). Then you can clone this repository and inside the folder you install all dependecies with:

```bash
yarn install
```

## Configuration in `config.json`

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

Additional you can specifiy mail credentials to send the results via mail. Just leave the mail setting, if you do not want to use it.


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

## Roadmap

* Impliment this a service with internal scheduling to support features like a results page or RSS Feed
* More comprehensive results with extracting HTML attributes or even converting relative links from the findings
