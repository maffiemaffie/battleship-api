let currentState = "";

const shipLengths = Object.freeze({
    "carrier": 5,
    "battleship": 4,
    "cruiser": 3,
    "submarine": 3,
    "destroyer": 2,
});

const currentConfig = Object.seal({
    "carrier": [],
    "battleship": [],
    "cruiser": [],
    "submarine": [],
    "destroyer": [],
});

const disableGrid = () => {
    for (const cell of document.querySelectorAll('#grid input')) {
        cell.setAttribute('disabled', '');
    }
}

const enableGrid = () => {
    for (const cell of document.querySelectorAll('#grid input')) {
        cell.removeAttribute('disabled');
    }
}

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

const getCell = (row, column) => {
    const rowSelector = `[data-row="${row}"]`;
    const columnSelector = `[data-column="${column}"]`;
    return document.querySelector(`#grid .cell${rowSelector}${columnSelector}`);
}

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
}

const placeSecondCell = (e) => {
    const firstCellRow = Number.parseInt(e.target.dataset.row);
    const firstCellColumn = Number.parseInt(e.target.dataset.column);

    const lastCell = document.querySelector('#grid .cell.selected');
    const lastCellRow = Number.parseInt(lastCell.dataset.row);
    const lastCellColumn = Number.parseInt(lastCell.dataset.column);

    const selectedShip = document.querySelector('input[name="battleship"]:checked').value;
    currentState = "noSelect";

    const path = getCellPath({ firstCellRow, firstCellColumn }, { lastCellRow, lastCellColumn });
    currentConfig[selectedShip] = path;

    updateBoard();
    disableGrid();
}

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

const battleshipSelected = () => {
    const selected = document.querySelector('input[name="battleship"]:checked').value;
    currentConfig[selected] = [];
    updateBoard();
    enableGrid();

    for (const cell of document.querySelectorAll('#grid input.occupied')) {
        cell.setAttribute('disabled', '');
    }

    currentState = "placingFirst";
}

export const initGameBoard = () => {
    currentState = "noSelect";
    const grid = document.querySelector('#grid');
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const button = document.createElement('input');
            button.setAttribute('type', 'button');
            button.setAttribute('disabled', "");
            button.classList.add('cell');   
            button.dataset.row = row;
            button.dataset.column = col;
            grid.insertAdjacentElement('beforeend', button);
        }
    }

    document.querySelector('#game-board').classList.remove('hidden');
    document.querySelector('#game-board').classList.add('placing-ships');

    for (const cell of document.querySelectorAll('#grid input')) {
        cell.addEventListener('click', cellClicked);
    }

    for (const radio of document.querySelectorAll('#battleship-select input')) {
        radio.addEventListener('change', battleshipSelected);
    }
}