export class BattleshipGame {
    private data: {
        player1:{
            ships:Array<Battleship>,
            board:boolean[][],
            guesses:{[index: string]:boolean},
            sunkShips:Array<Battleship>,
        },
        player2:{
            ships:Array<Battleship>,
            board:boolean[][],
            guesses:{[index: string]:boolean},
            sunkShips:Array<Battleship>,
        },
    };

    public status:BattleshipGame.Status;

    constructor() {
        this.data = {
            "player1":{
                "ships":[],
                "board":undefined,
                "guesses":{},
                "sunkShips":[],
            },
            "player2":{
                "ships":[],
                "board":undefined,
                "guesses":{},
                "sunkShips":[],
            },
        }

        this.status = BattleshipGame.Status.Prestart;
    }

    setBattleships(player:BattleshipGame.Player, ships:Array<Battleship>) {
        if (ships.length < BattleshipGame.battleshipsTemplate.length) {
            throw new BattleshipGame.InvalidParametersError('Too few battleships. No ships placed.');
        }
        if (ships.map(ship => ship.length).sort().join("") !== 
            BattleshipGame.battleshipsTemplate.map(ship => ship.length).sort().join("")) {
                throw new BattleshipGame.InvalidParametersError('Invalid ships: Ships are the wrong sizes. No ships placed');
        }
        if (this.status !== BattleshipGame.Status.Prestart) {
            throw new BattleshipGame.OutOfTurnError('Battleships cannot be placed at this time. No ships placed.');
        }
        
        const newBoard = BattleshipGame.getEmptyBoard();
        for (const ship of ships) {
            for (const cell of ship) {
                // ship outside bounds
                if (cell.row < 0 || cell.column < 0 || cell.row > 9 || cell.column > 9) {
                    throw new RangeError(`Battleship placed out of bounds. No ships placed.`);
                }
                // ship on top of another ship
                if (newBoard[cell.row][cell.column]) {
                    throw new Error(`Overlap between battleships. No ships placed.`);
                }
                newBoard[cell.row][cell.column] = true;
            }
        }
        // if it makes it through the whole thing it must be fine
        this.data[player].board = newBoard
        this.data[player].ships = ships;
        
        if (this.data.player1.board !== undefined && this.data.player2.board !== undefined) {
            this.status = BattleshipGame.Status.Player1Turn;
        }
    }

    shootTarget(player:BattleshipGame.Player, {row, column}:{row:string,column:string}):{'isHit':boolean,'sunkShips':Battleship|null} {
        const target:Cell = {
            'row': Number.parseInt(row),
            'column': Number.parseInt(column),
        }

        // out of turn or before/after game has started.
        if (player === BattleshipGame.Player.Player1 && this.status !== BattleshipGame.Status.Player1Turn) {
            throw new BattleshipGame.OutOfTurnError(`Target cannot be attacked at this time. No action was performed.`);
        }
        // out of turn or before/after game has started.
        if (player === BattleshipGame.Player.Player2 && this.status !== BattleshipGame.Status.Player2Turn) {
            throw new BattleshipGame.OutOfTurnError(`Target cannot be attacked at this time. No action was performed.`);
        }
        // target out of range.
        if (target.row < 0 || target.column < 0 || target.row > 9 || target.column > 9) {
            throw new RangeError(`Target out of bounds. No action was performed.`);
        }
        // target already attempted.
        if (this.data[player].guesses[JSON.stringify(target)] !== undefined) {
            throw new Error(`Target already attacked. No action was performed.`);
        }

        // if we made it this far, play the turn.
        this.status = this.status === BattleshipGame.Status.Player1Turn ? BattleshipGame.Status.Player2Turn : BattleshipGame.Status.Player1Turn;

        // get the other player
        const other = player === BattleshipGame.Player.Player1 ? BattleshipGame.Player.Player2 : BattleshipGame.Player.Player1;
        // for each ship
        for (const ship of this.data[other].ships) {
            // for each cell the ship occupies
            for (const cell of ship) {
                // if the cell is our target
                if (target.row == cell.row && target.column == cell.column) {
                    // log the guess
                    this.data[player].guesses[JSON.stringify(target)] = true;
                    // check the ship to see if it's sunk
                    for (const cell of ship) {
                        // if a cell hasn't been hit, return out of the function
                        if (this.data[player].guesses[JSON.stringify(cell)] === undefined) {
                            return {
                                'isHit': true,
                                'sunkShips': null,
                            }
                        }
                    }
                    // if no cell hasn't been hit, the ship is sunk
                    this.data[player].sunkShips.push(ship);
                    // have all ships been sunk?
                    if (this.data[player].sunkShips.length === this.data[other].ships.length) {
                        this.status = BattleshipGame.Status.GameOver;
                    }
                    return {
                        'isHit': true,
                        'sunkShips': ship,
                    };
                }
            }
        }
        // if no ship is hit by our target, log the guess and return
        this.data[player].guesses[JSON.stringify(target)] = false;
        return {
            'isHit': false,
            'sunkShips': null,
        };
    }

    getData(player:BattleshipGame.Player) {
        const other = player === BattleshipGame.Player.Player1 ? BattleshipGame.Player.Player2 : BattleshipGame.Player.Player1;

        const data = {
            ships: this.data[player].ships,
            board: this.data[player].board,
            myGuesses: this.data[player].guesses,
            opponentGuesses: this.data[other].guesses,
            shipsIveLost: this.data[other].sunkShips,
            shipsIveSunk: this.data[player].sunkShips,
        };

        return data;
    }

    static getEmptyBoard() {
        const board = [];
        for (let row = 0; row < 10; row++) {
            const nextRow = [];
            for (let col = 0; col < 10; col++) {
                nextRow.push(false);
            }
            board.push(nextRow);
        }
        return board;
    }
    static battleshipsTemplate = [
        new Array<Battleship>(5),
        new Array<Battleship>(4),
        new Array<Battleship>(3),
        new Array<Battleship>(3),
        new Array<Battleship>(2),
    ];
}

type Cell = {
    row:number,
    column:number,
}

type Battleship = Array<Cell>;

export namespace BattleshipGame {
    export enum Status {
        Prestart,
        Player1Turn,
        Player2Turn,
        GameOver,
    }

    export enum Player {
        Player1 = "player1",
        Player2 = "player2",
    }

    export class OutOfTurnError extends Error {
        constructor(message:string) {
            super(message);
            this.name = "OutOfTurnError";
        }
    }

    export class InvalidParametersError extends Error {
        constructor(message:string) {
            super(message);
            this.name = "InvalidParametersError";
        }
    }
}