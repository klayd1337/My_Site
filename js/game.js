const RIGHT = 1, LEFT = 2, UP = 3, DOWN = 4;

export function findZero(state) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (state[i][j] === 0) return [i, j];
        }
    }
    return [-1, -1];
}

export function actions(state) {
    const [i, j] = findZero(state);
    const possible = [];
    if (i > 0) possible.push(UP);
    if (i < 2) possible.push(DOWN);
    if (j > 0) possible.push(LEFT);
    if (j < 2) possible.push(RIGHT);
    return possible;
}

function successor(state, action) {
    const newS = [
        [state[0][0], state[0][1], state[0][2]],
        [state[1][0], state[1][1], state[1][2]],
        [state[2][0], state[2][1], state[2][2]]
    ];
    const [i, j] = findZero(state);
    
    if (action === LEFT) {
        // Пустая клетка меняется с левой
        newS[i][j] = state[i][j - 1];
        newS[i][j - 1] = 0;
    } else if (action === RIGHT) {
        // Пустая клетка меняется с правой
        newS[i][j] = state[i][j + 1];
        newS[i][j + 1] = 0;
    } else if (action === UP) {
        // Пустая клетка меняется с верхней
        newS[i][j] = state[i - 1][j];
        newS[i - 1][j] = 0;
    } else if (action === DOWN) {
        // Пустая клетка меняется с нижней
        newS[i][j] = state[i + 1][j];
        newS[i + 1][j] = 0;
    }
    return newS;
}

export function move(state, row, col) {
    const zero = findZero(state);
    const zeroRow = zero[0];
    const zeroCol = zero[1];
    
    // Проверяем, является ли кликнутая клетка соседней с пустой
    const isAdjacent = (Math.abs(row - zeroRow) === 1 && col === zeroCol) ||
                       (Math.abs(col - zeroCol) === 1 && row === zeroRow);
    
    if (!isAdjacent) {
        return state; // Неверный ход
    }
    
    // Определяем направление движения пустой клетки
    if (row === zeroRow && col === zeroCol - 1) {
        // Кликнули слева от пустой → пустая двигается влево
        return successor(state, LEFT);
    } else if (row === zeroRow && col === zeroCol + 1) {
        // Кликнули справа от пустой → пустая двигается вправо
        return successor(state, RIGHT);
    } else if (row === zeroRow - 1 && col === zeroCol) {
        // Кликнули сверху от пустой → пустая двигается вверх
        return successor(state, UP);
    } else if (row === zeroRow + 1 && col === zeroCol) {
        // Кликнули снизу от пустой → пустая двигается вниз
        return successor(state, DOWN);
    }
    
    return state;
}

export function isSolved(state) {
    const flat = state.flat();
    for (let i = 0; i < 8; i++) {
        if (flat[i] !== i + 1) return false;
    }
    return flat[8] === 0;
}

export function generatePuzzle() {
    const state = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0]
    ];
    
    // Делаем 1000 случайных ходов для перемешивания
    for (let i = 0; i < 1000; i++) {
        const possible = actions(state);
        const action = possible[Math.floor(Math.random() * possible.length)];
        const newState = successor(state, action);
        state[0] = [newState[0][0], newState[0][1], newState[0][2]];
        state[1] = [newState[1][0], newState[1][1], newState[1][2]];
        state[2] = [newState[2][0], newState[2][1], newState[2][2]];
    }
    return state;
}

export function copyState(state) {
    return [
        [state[0][0], state[0][1], state[0][2]],
        [state[1][0], state[1][1], state[1][2]],
        [state[2][0], state[2][1], state[2][2]]
    ];
}

export function isEqual(state1, state2) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (state1[i][j] !== state2[i][j]) return false;
        }
    }
    return true;
}