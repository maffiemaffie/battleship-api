const my = {
    'gameId': "",
    'playerId':"",
    'turnName': "",
}

const hardcodedShips = [ // for testing
    [
        { row: 0, column: 0 },
        { row: 0, column: 1 },
        { row: 0, column: 2 },
        { row: 0, column: 3 },
        { row: 0, column: 4 },
    ],
    [
        { row: 1, column: 0 },
        { row: 1, column: 1 },
        { row: 1, column: 2 },
        { row: 1, column: 3 },
    ],
    [
        { row: 2, column: 0 },
        { row: 2, column: 1 },
        { row: 2, column: 2 },
    ],
    [
        { row: 3, column: 0 },
        { row: 3, column: 1 },
        { row: 3, column: 2 },
    ],
    [
        { row: 4, column: 0 },
        { row: 4, column: 1 },
    ],
];

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

const logData = async () => {
    const query = {'gameId':my.gameId, 'playerId':my.playerId};

    const response = await sendFetchRequest('/data', 'GET', query);
    const responseJson = await response.json();
    console.log(responseJson);
}

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

const launchAttack = async () => {
    const form = document.querySelector('#launch-attack');
    const formData = new FormData(form);
    const row = formData.get('row');
    const column = formData.get('column');

    const query = {'gameId':my.gameId, 'playerId':my.playerId};
    const body = { 'target': {row, column} };

    const response = await sendFetchRequest('/shoot', 'POST', query, body);
    const responseJson = await response.json();

    switch(response.status) {
        case 200: 
            // update list
            const list = document.querySelector('#my-attacks');
            const li = document.createElement('li');
            let liText;
            console.log(responseJson);
            if (responseJson.isHit) {
                li.classList.add('hit');
                liText = document.createTextNode(`${row}, ${column}: hit`);
            } else {
                liText = document.createTextNode(`${row}, ${column}: miss`);
            }

            li.appendChild(liText);
            list.insertAdjacentElement('beforeend', li);

            // update board
            // disable attack
            disableForm(form);
            checkForTurn();
            break;
        case 422:
            // tell the user they fucked up
            console.log(responseJson.message);
        default:
            console.log(response.message);
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
                logData();
                enableForm(document.querySelector('#launch-attack'));
                break;
            case 'gameOver':
                // do game over stuff
                gameOver();
                break;
            default: 
                console.log('not my turn');
                setTimeout(checkForTurn, 2000);
        }
    }
}

/**
 * Sent when player is ready to start. Sends battleship configuration to the server.
 * If the battleship config is valid, wait for first turn to attack.
 * Otherwise, tell the player and wait for a new config to be submitted.
 */
const ready = async () => {
    const battleships = hardcodedShips;

    const response = await sendFetchRequest('/ready', 'POST', {'gameId': my.gameId, 'playerId': my.playerId}, {battleships});

    switch (response.status) {
        case 204:
            // disable battleship entry
            checkForTurn();
            break;
        case 422:
            // complain about the battleships
            const responseJson = await response.json();
            console.log(responseJson.message);
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

        //delete this after battleship setup is implemented
        ready();
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

            //delete this after battleship setup is implemented
            ready();
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
const init = () => {
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

    document.querySelector('#launch-attack').addEventListener('submit', e => {
        launchAttack();

        e.preventDefault();
        return false;
    });

}

window.onload = init;