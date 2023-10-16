/**
 * The current state of configuration placement.
 * @type {"noSelect"|"placingFirst"|"placingSecond"}
 */
let currentState = "noSelect";

/**
 * The length of each ship by name.
 */
const shipLengths = Object.freeze({
    "carrier": 5,
    "battleship": 4,
    "cruiser": 3,
    "submarine": 3,
    "destroyer": 2,
});

/**
 * The current location of all batlleships placed on the configuration board.
 * @type {{carrier:Array<{row:number,column:number}>,battleship:Array<{row:number,column:number}>,cruiser:Array<{row:number,column:number}>,submarine:Array<{row:number,column:number}>,destroyer:Array<{row:number,column:number}>}}
 */
const currentConfig = Object.seal({
    "carrier": [],
    "battleship": [],
    "cruiser": [],
    "submarine": [],
    "destroyer": [],
});

/**
 * Disable grid to user input.
 */
const disableGrid = () => {
    for (const cell of document.querySelectorAll('#grid input')) {
        cell.setAttribute('disabled', '');
    }
}

/**
 * Enable grid to user input.
 */
const enableGrid = () => {
    for (const cell of document.querySelectorAll('#grid input')) {
        cell.removeAttribute('disabled');
    }
}

/**
 * Enable submit if all ships are placed.
 */
const maybeEnableSubmit = () => {
    for (const ship of Object.values(currentConfig)) {
        if (ship.length === 0) return;
    }

    document.querySelector('#game-board [type="submit"]').removeAttribute('disabled');
}

/**
 * Takes in two cells and returns all cells in the straight line path between them.
 * @param {Object} firstCell - The first cell.
 * @param {number} firstCell.firstCellRow - The row of the first cell.
 * @param {number} firstCell.firstCellColumn - The column of the first cell.
 * @param {Object} lastCell - The last cell.
 * @param {number} lastCell.lastCellRow - The row of the last cell.
 * @param {number} lastCell.lastCellColumn - The column of the last cell.
 * @returns {Array<{row:number,column:number}>} All cells in the path including the start and end.
 */
const getCellPath = ({firstCellRow, firstCellColumn}, {lastCellRow, lastCellColumn}) => {
    const path = [];

    if (firstCellRow < lastCellRow) {
        for (let row = firstCellRow; row <= lastCellRow; row++) {
            path.push({
                'row': row,
                'column': firstCellColumn,
            });
        }
        return path;
    }
    if (lastCellRow < firstCellRow) {
        for (let row = lastCellRow; row <= firstCellRow; row++) {
            path.push({
                'row': row,
                'column': firstCellColumn,
            });
        }
        return path;
    }
    if (firstCellColumn < lastCellColumn) {
        for (let column = firstCellColumn; column <= lastCellColumn; column++) {
            path.push({
                'row': firstCellRow,
                'column': column,
            });
        }
        return path;
    }
    for (let column = lastCellColumn; column <= firstCellColumn; column++) {
        path.push({
            'row': firstCellRow,
            'column': column,
        });
    }
    return path;
}

/**
 * Returns a specified grid cell as an HTML element.
 * @param {number} row - the row of the cell.
 * @param {number} column - the column of the cell.
 * @returns {HTMLInputElement} the HTML element for the corresponding grid cell.
 */
const getCell = (row, column) => {
    const rowSelector = `[data-row="${row}"]`;
    const columnSelector = `[data-column="${column}"]`;
    return document.querySelector(`#grid .cell${rowSelector}${columnSelector}`);
}

/**
 * Updates the display of the grid.
 */
const updateBoard = () => {
    for (let row = 0; row < 10; row++) {
        for (let column = 0; column < 10; column++) {
            const cellElem = getCell(row, column);
            cellElem.classList.remove('occupied', 'selected', 'selectable');
        }
    }

    for (const ship of Object.values(currentConfig)) {
        for (const cell of ship) {
            const cellElem = getCell(cell.row, cell.column)
            cellElem.classList.add('occupied');
        }
    }
}

/**
 * Places the start of the battleship.
 * @param {PointerEvent} e - The click event. 
 */
const placeFirstCell = (e) => {
    e.target.classList.add('selected');
    const row = Number.parseInt(e.target.dataset.row);
    const column = Number.parseInt(e.target.dataset.column);

    const selectedShip = document.querySelector('input[name="battleship"]:checked').value;
    const shipOffset = shipLengths[selectedShip] - 1;

    const secondCellOptions = [
        { 'row': row - shipOffset, 'column': column },
        { 'row': row + shipOffset, 'column': column },
        { 'row': row, 'column': column - shipOffset },
        { 'row': row, 'column': column + shipOffset },
    ];

    disableGrid();

    for (const opt of secondCellOptions) {
        if (opt.row > 9 || opt.row < 0 || opt.column > 9 || opt.column < 0) continue;

        // vet path
        let pathPassed = true;

        const pathToOpt = getCellPath(
            { firstCellRow: row, firstCellColumn: column },
            { lastCellRow: opt.row, lastCellColumn: opt.column });
        
        for (const cell of pathToOpt) {
            const cellElem = getCell(cell.row, cell.column)
            if (!cellElem.classList.contains('occupied')) continue;
            pathPassed = false;
            break;
        }

        if (!pathPassed) continue;
        const optElem = getCell(opt.row, opt.column);
        optElem.classList.add('selectable');
        optElem.removeAttribute('disabled');
    }

    currentState = "placingSecond";
    document.querySelector('#reset-ship').removeAttribute('disabled');
}

/**
 * Places the end of the battleship.
 * @param {PointerEvent} e - The click event.
 */
const placeSecondCell = (e) => {
    const firstCellRow = Number.parseInt(e.target.dataset.row);
    const firstCellColumn = Number.parseInt(e.target.dataset.column);

    const lastCell = document.querySelector('#grid .cell.selected');
    const lastCellRow = Number.parseInt(lastCell.dataset.row);
    const lastCellColumn = Number.parseInt(lastCell.dataset.column);

    const inputElem = document.querySelector('input[name="battleship"]:checked');
    const selectedShip = inputElem.value;
    currentState = "noSelect";

    const path = getCellPath({ firstCellRow, firstCellColumn }, { lastCellRow, lastCellColumn });
    currentConfig[selectedShip] = path;

    inputElem.classList.add('placed');

    updateBoard();
    disableGrid();
    maybeEnableSubmit();
}

/**
 * Chooses which method to handle the function based on the game status.
 * @param {PointerEvent} e - The click event.
 */
const cellClicked = (e) => {
    switch (currentState) {
        case "placingFirst":
            placeFirstCell(e);
            break;
        case "placingSecond":
            placeSecondCell(e);
            break;
        default:
            return;
    }
}

/**
 * Called when a battleship is clicked on.
 */
const battleshipSelected = () => {
    document.querySelector('#game-board [type="submit"]').setAttribute('disabled', '');
    document.querySelector('#reset-ship').setAttribute('disabled', '');

    const inputElem = document.querySelector('input[name="battleship"]:checked');
    const selected = inputElem.value;
    inputElem.classList.remove('placed');
    currentConfig[selected] = [];
    updateBoard();
    enableGrid();

    for (const cell of document.querySelectorAll('#grid input.occupied')) {
        cell.setAttribute('disabled', '');
    }

    currentState = "placingFirst";
}

/**
 * Creates the grid and assigns event handlers.
 */
const initGameBoard = () => {
    currentState = "noSelect";
    const grid = document.querySelector('#grid');
    
    for (let row = 0; row < 10; row++) {
        for (let column = 0; column < 10; column++) {
            const button = document.createElement('input');
            button.setAttribute('type', 'button');
            button.setAttribute('disabled', "");
            button.classList.add('cell');   
            button.dataset.row = row;
            button.dataset.column = column;
            grid.insertAdjacentElement('beforeend', button);
        }
    }

    document.querySelector('#game-board-container').classList.remove('hidden');
    document.querySelector('#game-board [type="submit"]').setAttribute('disabled', '');
    document.querySelector('#reset-ship').setAttribute('disabled', '');

    for (const cell of document.querySelectorAll('#grid input')) {
        cell.addEventListener('click', cellClicked);
    }

    for (const radio of document.querySelectorAll('#battleship-select input')) {
        radio.addEventListener('change', battleshipSelected);
    }

    document.querySelector('#reset-ship').addEventListener('click', battleshipSelected);
}

export {
    currentConfig,
    initGameBoard,
    getCell,
};