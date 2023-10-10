// const http = require('http');
const btsh = require('./battleship.ts');

const games = {};
const players = {};

const createNewId = () => {
  const dateString = Date.now().toString().substring(7);
  const randomString = Math.trunc(Math.random() * 1000).toString();

  return Number.parseInt(randomString + dateString, 10).toString(36);
};

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
  const content = {
    board: btsh.BattleshipGame.getEmptyBoard(),
  };
  return respond(request, response, content, 200);
};

/**
 * Gets meta info about the board template.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getBoardTemplateMeta = (request, response) => respondWithoutContent(request, response, 200);

/**
 * Gets an Array in the shape of the expected battleship array.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getBattleshipTemplate = (request, response) => {
  const content = {
    battleships: btsh.BattleshipGame.battleshipsTemplate,
  };
  return respond(request, response, content, 200);
};

/**
 * Gets meta info about the battleship template.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getBattleshipTemplateMeta = (request, response) => {
  respondWithoutContent(request, response, 200);
};

/**
 * Gets the current status of the game (pre-start, player 1's turn, player 2's turn, game over).
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 */
const getStatus = (request, response, { gameId }) => {
  // invalid parameters - 400
  if (!gameId) {
    const content = {
      id: 'getStatusMissingParams',
      message: 'Must have query parameter \'gameId\'.',
    };
    return respond(request, response, content, 400);
  }
  // invalid game id - 404
  if (!games[gameId]) {
    const content = {
      id: 'getStatusNotFound',
      message: 'No game found with that ID',
    };
    return respond(request, response, content, 404);
  }
  // game found - 200
  const statusStrings = ['pendingStart', 'hostTurn', 'guestTurn', 'gameOver'];
  const content = {
    status: statusStrings[games[gameId].status],
  };
  return respond(request, response, content, 200);
};

/**
 * Gets meta info about the game status.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 */
const getStatusMeta = (request, response, { gameId }) => {
  // invalid parameters - 400
  if (!gameId) {
    return respondWithoutContent(request, response, 400);
  }
  // invalid game id - 404
  if (!games[gameId]) {
    return respond(request, response, 404);
  }
  // game found - 200
  return respondWithoutContent(request, response, 200);
};

/**
 * Gets all battleship data relevant to the requesting player.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 * @param {string} params.playerId - The id of the requesting player.
 */
const getGameData = (request, response, { gameId, playerId }) => {
  // invalid parameters - 400
  if (!gameId || !playerId) {
    const content = {
      id: 'getGameDataMissingParams',
      message: 'Must have query parameters \'gameId\' and \'playerId\'.',
    };
    return respond(request, response, content, 400);
  }
  // invalid game id - 404
  if (!games[gameId]) {
    const content = {
      id: 'getGameDataGameNotFound',
      message: 'No game found with that ID',
    };
    return respond(request, response, content, 404);
  }
  if (!players[playerId]) {
    const content = {
      id: 'getGameDataPlayerNotFound',
      message: 'No player found with that ID',
    };
    return respond(request, response, content, 404);
  }
  // game found - 200
  const content = {
    data: games[gameId].getData(players[playerId]),
  };
  return respond(request, response, content, 200);
};

/**
 * Gets meta info about the player game data.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 * @param {string} params.playerId - The id of the requesting player.
 */
const getGameDataMeta = (request, response, { gameId, playerId }) => {
  // invalid parameters - 400
  if (!gameId || !playerId) {
    return respondWithoutContent(request, response, 400);
  }
  // invalid game id - 404
  if (!games[gameId] || !players[playerId]) {
    return respondWithoutContent(request, response, 404);
  }
  // game found - 200
  return respondWithoutContent(request, response, 200);
};

/**
 * Responds when path doesn't resolve to an endpoint.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getNotFound = (request, response) => {
  const content = {
    id: 'notFound',
    message: 'No endpoint found at the requested path',
  };
  return respond(request, response, content, 404);
};

/**
 * Not found response without message.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const getNotFoundMeta = (request, response) => respondWithoutContent(request, response, 404);

/**
 * Creates a new battleship game.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
const createGame = (request, response) => {
  const gameId = createNewId();
  const playerId = createNewId();

  games[gameId] = new btsh.BattleshipGame();
  players[playerId] = btsh.BattleshipGame.Player.Player1;

  const content = {
    gameId,
    playerId,
  };
  respond(request, response, content, 201);
};

/**
 * Allows a user to join an existing game.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 */
const joinGame = (request, response, { gameId }) => {
  // invalid parameters - 400
  if (!gameId) {
    const content = {
      id: 'joinGameMissingParams',
      message: 'Must have query parameter \'gameId\'.',
    };
    return respond(request, response, content, 400);
  }
  // invalid game id - 404
  if (!games[gameId]) {
    const content = {
      id: 'joinGameGameNotFound',
      message: 'No game found with that ID',
    };
    return respond(request, response, content, 404);
  }
  // game found - 200
  const playerId = createNewId();
  players[playerId] = btsh.BattleshipGame.Player.Player2;

  const content = {
    playerId,
  };

  return respond(request, response, content, 200);
};

/**
 * Places all of the player's battleships on the board as specified.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 * @param {string} params.playerId - The id of the requesting player.
 */
const setBattleships = (request, response, { gameId, playerId }, { battleships }) => {
  // invalid parameters - 400
  if (!gameId || !playerId) {
    const content = {
      id: 'readyMissingQueryParams',
      message: 'Must have query parameters \'gameId\' and \'playerId\'.',
    };
    return respond(request, response, content, 400);
  }
  if (!battleships) {
    const content = {
      id: 'readyMissingBodyParams',
      message: 'Request submitted without battleships.',
    };
    return respond(request, response, content, 400);
  }
  // invalid game id - 404
  if (!games[gameId]) {
    const content = {
      id: 'readyGameNotFound',
      message: 'No game found with that ID',
    };
    return respond(request, response, content, 404);
  }
  if (!players[playerId]) {
    const content = {
      id: 'readyPlayerNotFound',
      message: 'No player found with that ID',
    };
    return respond(request, response, content, 404);
  }
  // game found - 200
  try {
    games[gameId].setBattleships(players[playerId], battleships);
    return respondWithoutContent(request, response, 204);
  } catch (err) {
    switch (err.name) {
      case 'OutOfTurnError': {
        const content = {
          id: 'readyForbidden',
          message: err.message,
        };
        return respond(request, response, content, 403);
      }
      case 'InvalidParametersError': {
        const content = {
          id: 'readyInvalidParameters',
          message: err.message,
        };
        return respond(request, response, content, 400);
      }
      case 'RangeError':
      case 'Error': {
        const content = {
          id: 'readyBattleshipError',
          message: err.message,
        };
        return respond(request, response, content, 422);
      }
      default: {
        const content = {
          id: 'readyInternal',
          message: 'A server error occured that prevented the action from being performed',
        };
        return respond(request, response, content, 500);
      }
    }
  }
};

/**
 * Shoots at a specified target on the other player's board.
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Object} params - The query parameters passed in the url.
 * @param {string} params.gameId - The id of the specified game.
 * @param {string} params.playerId - The id of the requesting player.
 */
const shootTarget = (request, response, { gameId, playerId }, { target }) => {
  // invalid parameters - 400
  if (!gameId || !playerId) {
    const content = {
      id: 'shootTargetMissingQueryParams',
      message: 'Must have query parameters \'gameId\' and \'playerId\'.',
    };
    return respond(request, response, content, 400);
  }
  if (!target) {
    const content = {
      id: 'shootTargetMissingBodyParams',
      message: 'Request submitted without target.',
    };
    return respond(request, response, content, 400);
  }
  if (target.row === undefined || target.column === undefined) {
    const content = {
      id: 'shootTargetInvalidParameters',
      message: 'target must contain both a \'row\' and \'row\' value.',
    };
    return respond(request, response, content, 400);
  }
  // invalid game id - 404
  if (!games[gameId]) {
    const content = {
      id: 'shootTargetGameNotFound',
      message: 'No game found with that ID',
    };
    return respond(request, response, content, 404);
  }
  if (!players[playerId]) {
    const content = {
      id: 'shootTargetPlayerNotFound',
      message: 'No player found with that ID',
    };
    return respond(request, response, content, 404);
  }
  // game found - 200
  try {
    const result = games[gameId].shootTarget(players[playerId], target);
    return respond(request, response, result, 200);
  } catch (err) {
    switch (err.name) {
      case 'OutOfTurnError': {
        const content = {
          id: 'shootTargetForbidden',
          message: err.message,
        };
        return respond(request, response, content, 403);
      }
      case 'RangeError':
      case 'Error': {
        const content = {
          id: 'shootTargetTargetError',
          message: err.message,
        };
        return respond(request, response, content, 422);
      }
      default: {
        const content = {
          id: 'readyInternal',
          message: 'A server error occured that prevented the action from being performed',
        };
        return respond(request, response, content, 500);
      }
    }
  }
};

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
};
