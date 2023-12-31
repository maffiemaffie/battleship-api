import { initGameBoard, currentConfig, getCell, setCurrentConfig } from "./configure-battleships.js";
import { activeCell, setCell, initAttackBoard, resetActive, disableTargetGrid, enableTargetGrid } from "./launch-attack.js";

const my = {
    'gameId': "",
    'playerId':"",
    'turnName': "",
}

/**
 * Takes a row-column pair and converts it to a letter-number pair.
 * @param {number} row - The row to be parsed.
 * @param {number} column - The column to be parsed.
 * @returns {string} The parsed string.
 */
const parseRowColumn = (row, column) => {
    const letters = Object.freeze(['A','B','C','D','E','F','G','H','I','J']);

    return letters[row] + (column + 1);
}

// const hardcodedShips = [
//     [
//         { row: 0, column: 0 },
//         { row: 0, column: 1 },
//         { row: 0, column: 2 },
//         { row: 0, column: 3 },
//         { row: 0, column: 4 },
//     ],
//     [
//         { row: 1, column: 0 },
//         { row: 1, column: 1 },
//         { row: 1, column: 2 },
//         { row: 1, column: 3 },
//     ],
//     [
//         { row: 2, column: 0 },
//         { row: 2, column: 1 },
//         { row: 2, column: 2 },
//     ],
//     [
//         { row: 3, column: 0 },
//         { row: 3, column: 1 },
//         { row: 3, column: 2 },
//     ],
//     [
//         { row: 4, column: 0 },
//         { row: 4, column: 1 },
//     ],
// ];

/**
 * Disables all inputs in a specified form.
 * @param {HTMLFormElement} form - The form to be disabled.
 */
const disableForm = (form) => {
    for (const input of form.querySelectorAll('input')) {
        input.setAttribute('disabled', true);
    }
}

/**
 * Enables all inputs in a specified form.
 * @param {HTMLFormElement} form - The form to be disabled.
 */
const enableForm = (form) => {
    for (const input of form.querySelectorAll('input')) {
        input.removeAttribute('disabled');
    }
}

/**
 * Fetches a specified resource with query parameters. Body is JSON.
 * @param {string} url - The resource to be fetched.
 * @param {string} method - The request method (e.g. GET, POST)
 * @param {Object} params - An object of query parameters.
 * @param {Object} body - The JSON body to send with the request.
 */
const sendFetchRequest = async (url, method, params, body) => {
    /**
     * Helper function parses the parameters into a querystring for the url.
     * @param {Object} params - The parameter object to parse.
     * @returns The parsed querystring.
     */
    const parseQueryString = (params) => {
        if (!params) return "";
        return '?' + Object.entries(params).map(([key, value]) => `${key}=${value}`).join("&");
    }
    const queryString = parseQueryString(params);
    const options = {
        method: method,
        headers: {
            'Accept': 'application/json',
        },
    }

    if (body) {
        options.headers['Content-Type'] = 'application/json',
        options.body = JSON.stringify(body);
    }

    return await fetch(url + queryString, options);
}

/**
 * For testing
 * Logs all player data to the console
 */
const logData = async () => {
    const query = {'gameId':my.gameId, 'playerId':my.playerId};

    const response = await sendFetchRequest('/data', 'GET', query);
    const responseJson = await response.json();
    console.log(responseJson);
}

/**
 * Checks who won and displays the appropriate text
 */
const gameOver = async () => {
    const query = {'gameId':my.gameId, 'playerId':my.playerId};

    const response = await sendFetchRequest('/data', 'GET', query);
    const responseJson = await response.json();

    switch(response.status) {
        case 200:
            if (responseJson.data.shipsIveSunk.length === 5) {
                document.querySelector('#you-won').classList.remove('hidden');
            } else {
                document.querySelector('#you-lost').classList.remove('hidden');
            }
        default:
            console.log(response);
    }
}

/**
 * Launches an attack on an opponent's board. Displays the result back to the player.
 */
const launchAttack = async () => {
    // const form = document.querySelector('#launch-attack');

    const row = Number.parseInt(activeCell.row);
    const column = Number.parseInt(activeCell.column);

    const query = { 'gameId':my.gameId, 'playerId':my.playerId };
    const body = { 'target': activeCell };

    const response = await sendFetchRequest('/shoot', 'POST', query, body);
    const responseJson = await response.json();

    switch(response.status) {
        case 200: 
            // update list
            const list = document.querySelector('#my-attacks');
            const li = document.createElement('li');
            let liText;
            if (responseJson.isHit) {
                li.classList.add('hit');
                liText = document.createTextNode(`${parseRowColumn(row, column)}: hit`);
            } else {
                liText = document.createTextNode(`${parseRowColumn(row, column)}: miss`);
            }
            resetActive();
            disableTargetGrid();
            setCell(row, column, responseJson.isHit);

            li.appendChild(liText);
            list.insertAdjacentElement('beforeend', li);
            list.scrollTop = list.scrollHeight;

            // update board
            // disable attack
            // disableForm(form);
            checkForTurn();
            break;
        case 422:
            // tell the user they fucked up
        default:
            console.log(response.message);
    }
}

/**
 * Updates the list of opponent attacks.
 */
const updateOpponentAttacks = async() => {
    const response = await sendFetchRequest('/data', 'GET', {'gameId': my.gameId, 'playerId':my.playerId});
    const responseJson = await response.json();

    if (response.status === 200) {
        for (const li of document.querySelectorAll('#opponent-attacks li')) li.remove();

        const list = document.querySelector('#opponent-attacks');
        for (const [attackedCell, result] of Object.entries(responseJson.data.opponentGuesses)) {
            const {row, column} = JSON.parse(attackedCell);
    
            // update list
            const li = document.createElement('li');
            let liText;
            if (result) {
                li.classList.add('hit');
                liText = document.createTextNode(`${parseRowColumn(row, column)}: hit`);
                getCell(row, column).classList.add('hit');
                getCell(row, column).value = '💥';
            } else {
                liText = document.createTextNode(`${parseRowColumn(row, column)}: miss`);
                getCell(row, column).classList.add('miss');
                getCell(row, column).value = '❌';
            }
    
            li.appendChild(liText);
            list.insertAdjacentElement('beforeend', li);
            list.scrollTop = list.scrollHeight;
        }
    }
}

/**
 * Check if it's this player's turn.
 * If it is, enables the attack form.
 * Otherwise, waits and then pings the server again.
 */
const checkForTurn = async () => {
    const response = await sendFetchRequest('/status', 'GET', {'gameId': my.gameId});
    const responseJson = await response.json();

    if (response.status === 200) {
        switch(responseJson.status) {
            case my.turnName:
                enableTargetGrid();
                updateOpponentAttacks();
                document.querySelector('#attack-board-container').classList.remove('hidden');
                document.querySelector('#my-attacks-container').classList.remove('hidden');
                document.querySelector('#opponent-attacks-container').classList.remove('hidden');
                break;
            case 'gameOver':
                // do game over stuff
                gameOver();
                break;
            default: 
                setTimeout(checkForTurn, 2000);
        }
    }
}

const autofill = async () => {
    const response = await sendFetchRequest('/battleshipTemplate', 'GET');
    const responseJson = await response.json();

    if (response.status === 200) {
        setCurrentConfig(responseJson.battleships);
        ready();
    }
}

/**
 * Sent when player is ready to start. Sends battleship configuration to the server.
 * If the battleship config is valid, wait for first turn to attack.
 * Otherwise, tell the player and wait for a new config to be submitted.
 */
const ready = async () => {
    const battleships = Object.values(currentConfig);

    const response = await sendFetchRequest('/ready', 'POST', {'gameId': my.gameId, 'playerId': my.playerId}, {battleships});

    switch (response.status) {
        case 204:
            // disable battleship entry
            document.querySelector('#battleship-select').classList.add('hidden');
            document.querySelector('#reset-ship').classList.add('hidden');
            checkForTurn();
            break;
        case 422:
            // complain about the battleships
            const responseJson = await response.json();
            break;
        default:
            console.log(response);
    }
}

/**
 * Creates a new game
 */
const createGame = async () => {
    const response = await sendFetchRequest('/new', 'POST');
    const responseJson = await response.json();
    
    if (response.status === 201) {
        document.querySelector('#game-id-display').innerHTML = responseJson.gameId;
        document.querySelector('#create-game-wrapper > p').classList.remove('hidden');
        disableForm(document.querySelector('#create-game'));
        disableForm(document.querySelector('#join-game'));

        my.gameId = responseJson.gameId;
        my.playerId = responseJson.playerId;
        my.turnName = 'hostTurn';

        initGameBoard();
        return;
    }
    alert(`Game couldn't be created (status ${response.status})`);
}

/**
 * Joins an existing game
 */
const joinGame = async () => {
    const form = document.querySelector('#join-game');
    const formData = new FormData(form);
    const gameId = formData.get('gameId');

    const response = await sendFetchRequest('/join', 'POST', {'gameId':gameId});
    const responseJson = await response.json();

    switch (response.status) {
        case 200:
            document.querySelector('#join-game-wrapper .success').classList.remove('hidden');
            disableForm(document.querySelector('#create-game'));
            disableForm(document.querySelector('#join-game'));    

            my.gameId = gameId;
            my.playerId = responseJson.playerId;
            my.turnName = 'guestTurn'

            initGameBoard();
            break;
        case 403:
            document.querySelector('#game-full').classList.remove('hidden');
            break;
        case 404:
            document.querySelector('#game-not-found').classList.remove('hidden');
            break;
        default:
            console.log(response);
    }
}

/**
 * Form handlers
 */
(() => {
    document.querySelector('#create-game').addEventListener('submit', e => {
        createGame();

        e.preventDefault();
        return false;
    });

    document.querySelector('#join-game').addEventListener('submit', e => {
        joinGame();

        e.preventDefault();
        return false;
    });

    // disableForm(document.querySelector('#launch-attack'));
    // document.querySelector('#launch-attack').addEventListener('submit', e => {
    document.querySelector('#attack-board').addEventListener('submit', e => {
        launchAttack();

        e.preventDefault();
        return false;
    });

    document.querySelector('#game-board').addEventListener('submit', e => {
        ready();

        disableForm(e.target);

        e.preventDefault();
        return false;
    });

    // document.querySelector('#autofill-ships').addEventListener('click', autofill);

    initAttackBoard();
})();