const fs = require('fs');

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
  response.write(css);
  response.end();
}

module.exports = {
  getIndex,
  getCSS,
  getIndexJS,
};
