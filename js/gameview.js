export const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const d = 3;
const SIZE = canvas.width;
const TILE_SIZE = SIZE / d;
const PADDING = 5;
const RADIUS = 10;

const COLORS = {
    bg: '#1a1a2e',
    tile: '#4a4a6a',
    tileHover: '#5a5a8a',
    tileSolved: '#3a7a5a',
    text: '#e8e8f0',
    textSolved: '#80d080',
    shadow: 'rgba(0,0,0,0.4)',
    border: 'rgba(255,255,255,0.08)'
};

canvas.style.backgroundColor = COLORS.bg;

class Tile {
    constructor(i, j, n, isSolved = false) {
        this.row = i;
        this.col = j;
        this.val = n;
        this.isSolved = isSolved;
    }

    draw(offsetX = 0, offsetY = 0) {
        if (this.val === 0) return;
        
        const x = (this.col + offsetX) * TILE_SIZE + PADDING / 2;
        const y = (this.row + offsetY) * TILE_SIZE + PADDING / 2;
        const size = TILE_SIZE - PADDING;
        
        ctx.shadowColor = COLORS.shadow;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;
        
        roundRect(ctx, x, y, size, size, RADIUS);
        ctx.fillStyle = this.isSolved ? COLORS.tileSolved : COLORS.tile;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, size, size, RADIUS);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.isSolved ? COLORS.textSolved : COLORS.text;
        ctx.font = `600 ${TILE_SIZE * 0.45}px 'Montserrat', 'Segoe UI', Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.val, x + size / 2, y + size / 2 + 2);
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export class GameView {
    constructor(state, isSolved = false, animating = false) {
        if (!animating) {
            ctx.clearRect(0, 0, SIZE, SIZE);
            ctx.fillStyle = COLORS.bg;
            ctx.fillRect(0, 0, SIZE, SIZE);
        }
        
        this.board = [];
        for (let i = 0; i < d; i++) {
            this.board[i] = [];
            for (let j = 0; j < d; j++) {
                const solved = isSolved && state[i][j] !== 0;
                this.board[i][j] = new Tile(i, j, state[i][j], solved);
            }
        }
        
        if (!animating) {
            this.draw();
        }
    }
    
    draw() {
        for (let i = 0; i < d; i++) {
            for (let j = 0; j < d; j++) {
                this.board[i][j].draw();
            }
        }
    }
}

export function clickToTile(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const canvasX = (x - rect.left) * scale;
    const canvasY = (y - rect.top) * scale;
    
    const col = Math.floor(canvasX / TILE_SIZE);
    const row = Math.floor(canvasY / TILE_SIZE);
    return [row, col];
}

export function animateMove(fromState, toState, callback) {
    const zeroFrom = findZeroInState(fromState);
    const zeroTo = findZeroInState(toState);

    let movedTile = null;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (fromState[i][j] !== 0 && fromState[i][j] !== toState[i][j]) {
                movedTile = { val: fromState[i][j], fromRow: i, fromCol: j };
            }
        }
    }
    
    if (!movedTile) {
        callback();
        return;
    }
    
    const startRow = movedTile.fromRow;
    const startCol = movedTile.fromCol;
    const endRow = zeroTo[0];
    const endCol = zeroTo[1];
    
    const startTime = performance.now();
    const duration = 150;
    
    function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        
        const currentRow = startRow + (endRow - startRow) * ease;
        const currentCol = startCol + (endCol - startCol) * ease;
        
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, SIZE, SIZE);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const val = toState[i][j];
                if (val === 0) continue;
                
                if (i === endRow && j === endCol && val === movedTile.val) {
                    const tile = new Tile(currentRow, currentCol, val);
                    tile.draw();
                } else {
                    const tile = new Tile(i, j, val);
                    tile.draw();
                }
            }
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, SIZE, SIZE);
            ctx.fillStyle = COLORS.bg;
            ctx.fillRect(0, 0, SIZE, SIZE);
            const finalView = new GameView(toState);
            finalView.draw();
            callback();
        }
    }
    
    animate();
}

function findZeroInState(state) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (state[i][j] === 0) return [i, j];
        }
    }
    return [-1, -1];
}