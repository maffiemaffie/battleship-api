export class BattleshipGame {
    private data: {
        player1:{
            ships:Array<Battleship>,
            board:boolean[][],
            guesses:Map<string, boolean>,
            sunkShips:Array<Battleship>,
        },
        player2:{
            ships:Array<Battleship>,
            board:boolean[][],
            guesses:Map<string, boolean>,
            sunkShips:Array<Battleship>,
        },
    };

    public status:BattleshipGame.Status;

    constructor() {
        this.data = {
            "player1":{
                "ships":[],
                "board":undefined,
                "guesses":new Map<string, boolean>(),
                "sunkShips":[],
            },
            "player2":{
                "ships":[],
                "board":undefined,
                "guesses":new Map<string, boolean>(),
                "sunkShips":[],
            },
        }

        this.status = BattleshipGame.Status.Prestart;
    }

    setBattleships(player:BattleshipGame.Player, ships:Array<Battleship>) {
        if (this.status !== BattleshipGame.Status.Prestart) throw new Error('Battleships cannot be placed at this time.');
        
        const newBoard = new Array(10).fill(new Array(10).fill(false));
        for (const ship of ships) {
            for (const cell of ship) {
                // ship outside bounds
                if (cell.row < 0 || cell.column < 0 || cell.row > 9 || cell.column > 9) {
                    throw new RangeError(`Battleship placed out of bounds. No ships placed.`);
                }
                // ship on top of another ship
                if (newBoard[cell.row][cell.column]) throw new Error(`Overlap between battleships. No ships placed.`);
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

    shootTarget(player:BattleshipGame.Player, target:Cell):{'isHit':boolean,'sunkShips':Battleship|null} {
        // out of turn or before/after game has started.
        if (player === BattleshipGame.Player.Player1 && this.status !== BattleshipGame.Status.Player1Turn) {
            throw new Error(`Target cannot be attacked at this time. No action was performed.`);
        }
        // out of turn or before/after game has started.
        if (player === BattleshipGame.Player.Player2 && this.status !== BattleshipGame.Status.Player2Turn) {
            throw new Error(`Target cannot be attacked at this time. No action was performed.`);
        }
        // target out of range.
        if (target.row < 0 || target.column < 0 || target.row > 9 || target.column > 9) {
            throw new RangeError(`Target out of bounds. No action was performed.`);
        }
        // target already attempted.
        if (this.data[player].guesses.has(JSON.stringify(target))) {
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
                if (target.row === cell.row && target.column === cell.column) {
                    // log the guess
                    this.data[player].guesses.set(JSON.stringify(target), true);
                    // check the ship to see if it's sunk
                    for (const cell of ship) {
                        // if a cell hasn't been hit, return out of the function
                        if (!this.data[player].guesses.has(JSON.stringify(cell))) {
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
        this.data[player].guesses.set(JSON.stringify(target), false);
        return {
            'isHit': false,
            'sunkShips': null,
        };
    }
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
}