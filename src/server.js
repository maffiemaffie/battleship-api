// const http = require('http');
// const url = require('url');

const bts = require('./battleship.ts');

const game = new bts.BattleshipGame();
const battleship1 = [
  { row: 0, column: 1 },
  { row: 0, column: 2 },
  { row: 0, column: 3 },
];

const battleship2 = [
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 1, column: 3 },
];
