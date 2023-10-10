class InvalidParametersError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidParametersError";
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}

const sendFetchRequest = async (url, method, params, body) => {
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

const createGame = async () => {
    const response = await sendFetchRequest('/new', 'POST');
    const responseJson = await response.json();
    
    if (response.status === 201) {
        document.querySelector('#create-game-wrapper > p').innerHTML = responseJson.gameId;
    }
    alert("Game couldn't be created");
}

const joinGame = async (gameId) => {
    const response = await sendFetchRequest('/join', 'POST', {'gameId':gameId});
    const responseJson = await response.json();

    switch (response.status) {
        case 200:
            return responseJson;
        case 400:
            throw new InvalidParametersError(responseJson.message);
        case 404:
            throw new NotFoundError(responseJson.message);
    }
}

const init = () => {
    document.querySelector('#create-game').addEventListener('submit', e => {
        createGame();

        e.preventDefault();
        return false;
    });
}

window.onload = init;