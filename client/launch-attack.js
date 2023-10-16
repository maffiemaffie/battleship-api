/**
 * The current selected cell.
 * @type {{row:number,column:number}|null}
 */
let activeCell = null;

/**
 * Returns a specified grid cell as an HTML element.
 * @param {number} row - the row of the cell.
 * @param {number} column - the column of the cell.
 * @returns {HTMLInputElement} the HTML element for the corresponding grid cell.
 */
const getCell = (row, column) => {
    const rowSelector = `[data-row="${row}"]`;
    const columnSelector = `[data-column="${column}"]`;
    return document.querySelector(`#attack-grid .cell${rowSelector}${columnSelector}`);
}

/**
 * Sets the display of an attacked cell.
 * @param {number} row - The row of the cell.
 * @param {number} column - The column of the cell.
 * @param {boolean} isHit - True if the cell has been hit.
 */
const setCell = (row, column, isHit) => {
    const cellElem = getCell(row, column);
    cellElem.setAttribute('disabled','');
    if (isHit) {
        cellElem.classList.add('hit');
        cellElem.value = '💥';
    } else {
        cellElem.classList.add('miss');
        cellElem.value = '❌';
    }
}

/**
 * Resets the selected cell.
 */
const resetActive = () => {
    getCell(activeCell.row, activeCell.column).classList.remove('attack');
    activeCell = null;
}

/**
 * Disables every cell in the attack grid.
 */
const disableTargetGrid = () => {
    for (const input of document.querySelectorAll('#attack-grid input.cell')) {
        input.setAttribute('disabled', '');
    }
    document.querySelector('#attack-board [type="submit"]').setAttribute('disabled', '');
}

/**
 * Enables every cell in the attack grid.
 */
const enableTargetGrid = () => {
    for (const input of document.querySelectorAll('#attack-grid input.cell:not(.miss):not(.hit)')) {
        input.removeAttribute('disabled');
    }
}

/**
 * Changes the cell selection.
 * @param {PointerEvent} e - The click event.
 */
const targetClicked = (e) => {
    const row = e.target.dataset.row;
    const column = e.target.dataset.column;

    if (activeCell) {
        const activeCellElem = getCell(activeCell.row, activeCell.column);
        activeCellElem.classList.remove('attack');
        activeCellElem.value = '';
    }

    const newActive = getCell(row, column)
    newActive.classList.add('attack');
    newActive.value = '𐀏';
    activeCell = {row, column};

    document.querySelector('#attack-board [type="submit"]').removeAttribute('disabled');
}

/**
 * Builds the grid and initializes event handlers.
 */
const initAttackBoard = () => {
    const grid = document.querySelector('#attack-grid');
    
    for (let row = 0; row < 10; row++) {
        for (let column = 0; column < 10; column++) {
            const button = document.createElement('input');
            button.setAttribute('type', 'button');
            button.classList.add('cell');
            button.dataset.row = row;
            button.dataset.column = column;
            button.addEventListener('click', e => {
                targetClicked(e);

                e.preventDefault();
                return false;
            });
            grid.insertAdjacentElement('beforeend', button);
        }
    }
}

export { initAttackBoard, setCell, activeCell, resetActive, disableTargetGrid, enableTargetGrid };