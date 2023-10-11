# Battleship API

## [Creating a new game](#creating-a-new-game)
`POST /new`  
Creates a new game of battleship.

### Example Response (201)
```json
{
    "gameId": "dq5lqs",
    "playerId": "3ah310",
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|201|The game has successfully been created|


## [Joining an existing game](#joining-an-existing-game)
`POST /join`  
Joins an existing game of battleship.

### Query Parameters
#### `gameId` (string)
The id of the game to be joined.

### Example Response (200)
```json
{
    "playerId": "e4ublr",
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|200|The game has successfully been joined|
|403|The game is already full|
|404|No game with matching ID found|

## [Setting battleships and starting the game](#setting-battleships-and-starting-the-game)
`POST /ready`  
If game status is `pendingStart` (see [status](#get-the-game-status)), places the battleships on the board and readies the server to begin the game.

### Query Parameters
#### `gameId` (string)
The id of the active game.
#### `playerId` (string)
The id of the requesting player.

### Body Parameters
#### `battleships` (object)
The starting configuration of battleships. [See `/battleshipTemplate`](#get-the-template-for-battleships) for the specific schema.

### HTTP Status Codes
| Status Code | Description |
|-|-|
|204|The battleship configuration was accepted|
|403|Configuration was attempted after the game was started|
|404|Either the game or the player couldn't be found|
|422|The battleship configuration was invalid (overlapping ships, ship not on grid)|

## [Launching Attacks](#launching-attacks)
`POST /shoot`  
If it's the requesting player's turn, launches an attack at a specified target cell. Responds with the result of the attack.

### Query Parameters
#### `gameId` (string)
The id of the active game.
#### `playerId` (string)
The id of the attacking player.

### Body Parameters
#### `target` (Object)
The target grid cell to be attacked.
#### `target.row` (number)
The target row 
#### `target.column` (number)
The target column

### Example Response (200)
```json
{
    "isHit": "true",
    "sunkShips": [
        { "row": 3, "column": 2 },
        { "row": 4, "column": 2 },
        { "row": 5, "column": 2 },
    ],
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|200|The target was successfully attacked|
|403|An attack can't be made at this time (game not started, out of turn, game over)|
|404|Either the game or the player couldn't be found|
|422|The target was invalid (target already attacked, target not on grid)|

## [Get an empty board](#get-an-empty-board)
`GET /boardTemplate`  
Returns a 10x10 2D array of `false`'s, representing the board with no battleships.

### Example Response (200)
```json
{
    "board": [...],
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|200|Success|

## [Get the template for battleships](#get-the-template-for-battleships)
`Get /battleshipTemplate`  
Returns an example of a valid battleship configuration (see [battleship configuration](#setting-battleships-and-starting-the-game)). Returned object contains a 5-grid-cell array, a 4-grid-cell array, two 3-grid-cell arrays, and a 2-grid-cell array.

### Example Response (200)
```json
{
    "battleships":[
        [
            {"row":0,"column":0},
            {"row":0,"column":1},
            "..."
        ],
        [
            {"row":1,"column":0},
            {"row":1,"column":1},
            "..."
        ],
        "..."
    ]
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|200|Success|

## [Get the game status](#get-the-game-status)
`GET /status`  
Returns the current status of the game (`pendingStart`, `hostTurn`, `guestTurn`, `gameOver`).

### Query Parameters
#### `gameId` (string)
The id of the active game.

### Example Response (200)
```json
{
    "status"; "pendingStart",
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|200|Success|
|404|No game with matching ID found|

## [Get your game data](#get-your-game-data)
`GET /data`  
Returns all game data relevant to the requesting player.  
Includes:
- the location of all battleships belonging to the player
- the game board with every occupied cell
- every guess the player has made
- every guess their opponent has made
- every ship sunk belonging to the player
- every ship sunk belonging to their opponent.

### Query Parameters
#### `gameId` (string)
The id of the active game.
#### `playerId` (string)
The id of the requesting player.

### Example Response (200)
```json
{
    "data": {
        "ships": [...],
        "board": [...],
        "myGuesses": {
            "{\"row\":0,\"column\":1}": true,
            "{\"row\":0,\"column\":2}": true,
            "..."
        },
        "opponentGuesses": {
            "{\"row\":4,\"column\":2}": false,
            "{\"row\":2,\"column\":3}": false,
            "..."
        },
        "shipsIveLost": [],
        "shipsIveSunk": [],
}
```

### HTTP Status Codes
| Status Code | Description |
|-|-|
|204|The battleship configuration was accepted|
|404|Either the game or the player couldn't be found|