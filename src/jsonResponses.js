const http = require('http');
const btsh = require('./battleship.ts');

const game = new btsh.BattleshipGame();

/**
 * Responds to an http request with json data.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} content - An object containing the response body.
 * @param {number} code - The http status code to respond with.
 */
const respond = (request, response, content, code) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(content));
    response.end();
};

/**
 * Responds to an http request without a response body.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {number} code - The http status code to respond with.
 */
const respondWithoutContent = (request, response, code) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end();
};

/**
 * Gets an empty battleship board. Useful if the client needs to know the bounds of the board.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const getBoardTemplate = (request, response) => {
    
}

/**
 * Gets meta info about the board template.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const getBoardTemplateMeta = (request, response) => {

}

/**
 * Gets an Array in the shape of the expected battleship array.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const getBattleshipTemplate = (request, response) => {

}

/**
 * Gets meta info about the battleship template.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const getBattleshipTemplateMeta = (request, response) => {

}

/**
 * Gets the current status of the game (pre-start, player 1's turn, player 2's turn, game over).
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 */
const getStatus = (request, response, { gameId }) => {

}

/**
 * Gets meta info about the game status.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 */
const getStatusMeta = (request, response, { gameId }) => {

}

/**
 * Gets all battleship data relevant to the requesting player.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 * @param {string} params.playerId - The id of the requesting player. 
 */
const getGameData = (request, response, { gameId, playerId }) => {

}

/**
 * Gets meta info about the player game data.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 * @param {string} params.playerId - The id of the requesting player. 
 */
const getGameDataMeta = (request, response, { gameId, playerId }) => {

}

/**
 * Responds when path doesn't resolve to an endpoint.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const getNotFound = (request, response) => {

}

/**
 * Not found response without message.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const getNotMeta = (request, response) => {

}

/**
 * Creates a new battleship game.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
const createGame = (request, response) => {

}

/**
 * Allows a user to join an existing game.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 */
const joinGame = (request, response, { gameId }) => {

}

/**
 * Places all of the player's battleships on the board as specified.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 * @param {string} params.playerId - The id of the requesting player. 
 */
const setBattleships = (request, response, { gameId, playerId }) => {

}

/**
 * Shoots at a specified target on the other player's board.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game. 
 * @param {string} params.playerId - The id of the requesting player. 
 */
const shootTarget = (request, response, { gameId, playerId }) => {

} 

module.exports = {
    getBoardTemplate,
    getBattleshipTemplate,
    getStatus,
    getGameData,
    getNotFound,
    getBoardTemplateMeta,
    getBattleshipTemplateMeta,
    getStatusMeta,
    getGameDataMeta,
    getNotFoundMeta,
    createGame,
    joinGame,
    setBattleships,
    shootTarget,
}