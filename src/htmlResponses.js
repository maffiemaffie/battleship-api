const fs = require('fs');

/**
 * Gets a requested file.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {string} filepath - Path to the requested file.
 * @param {string} contentType - MIME content type of the requested file.
 */
const sendFile = (request, response, filepath, contentType) => {
  const file = fs.readFileSync(filepath);

  response.writeHead(200, { 'Content-Type': contentType });
  response.write(file);
  response.end();
};

/**
 * Gets the index html page.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getIndex = (request, response) => sendFile(request, response, `${__dirname}/../client/index.html`, 'text/html');

/**
 * Gets the CSS stylesheet.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getCSS = (request, response) => sendFile(request, response, `${__dirname}/../client/style.css`, 'text/css');

const getIndexJS = (request, response) => sendFile(request, response, `${__dirname}/../client/index.js`, 'text/javascript');

const getConfigureBattleshipsJS = (request, response) => sendFile(request, response, `${__dirname}/../client/configure-battleships.js`, 'text/javascript');

const getLaunchAttackJS = (request, response) => sendFile(request, response, `${__dirname}/../client/launch-attack.js`, 'text/javascript');

module.exports = {
  getIndex,
  getCSS,
  getIndexJS,
  getConfigureBattleshipsJS,
  getLaunchAttackJS,
};
