const fs = require('fs');
const { IncomingMessage, ServerResponse } = require('http');

/**
 * Gets the index html page.
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
const getIndex = (request, response) => {

};

/**
 * Gets the CSS stylesheet.
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
const getCSS = (request, response) => {

};

module.exports = {
    getIndex,
    getCSS,
};