import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, setCell, isValidBoard, isComplete } from '../src/game.js';

const solution = [
    [0,0,1,0,1,1],
    [0,1,0,1,0,1],
    [1,1,0,0,1,0],
    [1,0,1,1,0,0],
    [0,1,1,0,0,1],
    [1,0,0,1,1,0],
];
const empty = () => Array.from({ length: 6 }, () => Array(6).fill(null));
const puzzle = () => solution.map((row, r) => row.map((value, c) => r === c ? null : value));

test('SB01: tabuleiro vazio 6x6 é válido e incompleto', () => {
    const game = createGame(empty());
    assert.equal(game.board.length, 6);
    assert.ok(game.board.every(row => row.length === 6));
    assert.equal(isValidBoard(game.board), true);
    assert.equal(isComplete(game.board), false);
    assert.equal(game.status, 'playing');
});

test('SB02: solução completa atende às regras binárias', () => {
    assert.equal(isValidBoard(solution), true);
    assert.equal(isComplete(solution), true);
    assert.equal(createGame(solution).status, 'won');
});

test('SB03: aceita puzzle parcialmente preenchido', () => {
    assert.equal(isValidBoard(puzzle()), true);
    assert.equal(isComplete(puzzle()), false);
});

test('SB04: preserva as pistas iniciais e marca casas editáveis', () => {
    const input = puzzle();
    const game = createGame(input);
    assert.deepEqual(game.board, input);
    assert.equal(game.fixed[0][0], false);
    assert.equal(game.fixed[0][1], true);
});

test('SB05: inserir zero ou um em casa editável atualiza o tabuleiro', () => {
    for (const value of [0, 1]) {
        const game = setCell(createGame(empty()), 0, 0, value);
        assert.equal(game.board[0][0], value);
        assert.equal(game.status, 'playing');
    }
});

test('SB06: permite corrigir e limpar casas inseridas pelo jogador', () => {
    const entered = setCell(createGame(empty()), 2, 2, 0);
    const changed = setCell(entered, 2, 2, 1);
    assert.equal(changed.board[2][2], 1);
    assert.equal(setCell(changed, 2, 2, null).board[2][2], null);
});

test('SB07: proíbe alterar ou apagar pista original', () => {
    const game = createGame(puzzle());
    for (const value of [1, null]) assert.throws(() => setCell(game, 0, 1, value));
    assert.equal(game.board[0][1], 0);
});

test('SB08: rejeita três zeros ou três uns consecutivos em linha', () => {
    for (const value of [0, 1]) {
        const board = empty();
        board[2].splice(2, 3, value, value, value);
        assert.equal(isValidBoard(board), false);
    }
});

test('SB09: rejeita três valores iguais consecutivos em coluna', () => {
    for (const value of [0, 1]) {
        const board = empty();
        for (const row of [1, 2, 3]) board[row][4] = value;
        assert.equal(isValidBoard(board), false);
    }
});

test('SB10: detecta trincas no início e no fim da linha e da coluna', () => {
    for (const start of [0, 3]) {
        const rowBoard = empty();
        const colBoard = empty();
        for (let offset = 0; offset < 3; offset++) {
            rowBoard[5][start + offset] = 0;
            colBoard[start + offset][5] = 1;
        }
        assert.equal(isValidBoard(rowBoard), false);
        assert.equal(isValidBoard(colBoard), false);
    }
});

test('SB11: rejeita mais de três ocorrências de um valor em linha incompleta', () => {
    for (const value of [0, 1]) {
        const board = empty();
        board[0] = [value, value, null, value, value, null];
        assert.equal(isValidBoard(board), false);
    }
});

test('SB12: rejeita mais de três ocorrências de um valor em coluna incompleta', () => {
    const board = empty();
    for (const row of [0, 1, 3, 4]) board[row][0] = 1;
    assert.equal(isValidBoard(board), false);
});

test('SB13: linhas completas devem ser diferentes entre si', () => {
    const board = empty();
    board[0] = [0,0,1,0,1,1];
    board[2] = [0,0,1,0,1,1];
    assert.equal(isValidBoard(board), false);
});

test('SB14: colunas completas devem ser diferentes entre si', () => {
    const board = empty();
    const column = [0,0,1,0,1,1];
    column.forEach((value, row) => { board[row][0] = value; board[row][2] = value; });
    assert.equal(isValidBoard(board), false);
});

test('SB15: padrões iguais ainda incompletos são permitidos', () => {
    const board = empty();
    board[0] = [0,1,null,null,null,null];
    board[1] = [0,1,null,null,null,null];
    assert.equal(isValidBoard(board), true);
});

test('SB16: forma e valores inválidos são rejeitados', () => {
    for (const board of [null, [], [[0]], Array.from({length:6}, () => Array(5).fill(null))]) {
        assert.equal(isValidBoard(board), false);
        assert.equal(isComplete(board), false);
        assert.throws(() => createGame(board));
    }
    for (const value of [2, -1, '0', true, undefined, NaN]) {
        const board = empty();
        board[0][0] = value;
        assert.equal(isValidBoard(board), false);
        assert.throws(() => createGame(board));
    }
});

test('SB17: inserção que cria trinca é rejeitada sem alterar o jogo', () => {
    let game = createGame(empty());
    game = setCell(game, 0, 0, 0);
    game = setCell(game, 0, 1, 0);
    const before = structuredClone(game);
    assert.throws(() => setCell(game, 0, 2, 0));
    assert.deepEqual(game, before);
});

test('SB18: coordenadas e valores de jogada inválidos lançam exceção', () => {
    const game = createGame(empty());
    for (const [row,col] of [[-1,0],[6,0],[0,6],[0.5,0]]) {
        assert.throws(() => setCell(game, row, col, 0));
    }
    for (const value of [2,-1,'1',true,undefined]) assert.throws(() => setCell(game, 0, 0, value));
});

test('SB19: preencher o último espaço com valor correto vence a partida', () => {
    const board = structuredClone(solution);
    board[5][5] = null;
    const game = setCell(createGame(board), 5, 5, solution[5][5]);
    assert.equal(game.status, 'won');
    assert.equal(isComplete(game.board), true);
    assert.deepEqual(game.board, solution);
});

test('SB20: completar várias casas preserva pistas e vence somente no final', () => {
    let game = createGame(puzzle());
    for (let i = 0; i < 6; i++) {
        assert.equal(game.status, 'playing');
        game = setCell(game, i, i, solution[i][i]);
    }
    assert.equal(game.status, 'won');
    assert.deepEqual(game.board, solution);
});

test('SB21: tabuleiro cheio inválido não é considerado completo', () => {
    assert.equal(isComplete(Array.from({length:6}, () => [0,1,0,1,0,1])), false);
});

test('SB22: construtor copia o puzzle e jogadas preservam o estado de entrada', () => {
    const input = empty();
    const game = createGame(input);
    input[0][0] = 1;
    assert.equal(game.board[0][0], null);
    const before = structuredClone(game);
    setCell(game, 0, 0, 0);
    assert.deepEqual(game, before);
});

test('SB23: partida vencida permanece inalterada em nova jogada válida', () => {
    const board = structuredClone(solution);
    board[5][5] = null;
    const won = setCell(createGame(board), 5, 5, 0);
    assert.deepEqual(setCell(won, 5, 5, null), won);
});

test('SB24: jogada que excede três ocorrências é rejeitada', () => {
    const board = empty();
    board[0] = [0,0,null,0,null,null];
    const game = createGame(board);
    assert.throws(() => setCell(game, 0, 4, 0));
});

test('SB25: jogada que duplica linha ou coluna completa é rejeitada', () => {
    const rowBoard = empty();
    rowBoard[0] = [0,0,1,0,1,1];
    rowBoard[2] = [0,0,1,0,1,null];
    assert.throws(() => setCell(createGame(rowBoard), 2, 5, 1));
    const colBoard = empty();
    [0,0,1,0,1,1].forEach((value, row) => {
        colBoard[row][0] = value;
        colBoard[row][2] = row === 5 ? null : value;
    });
    assert.throws(() => setCell(createGame(colBoard), 5, 2, 1));
});
