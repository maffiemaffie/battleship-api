const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/index.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const indexjs = fs.readFileSync(`${__dirname}/../client/index.js`);

/**
 * Gets the index html page.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

/**
 * Gets the CSS stylesheet.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getIndexJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/js' });
  response.write(indexjs);
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getIndexJS,
};
