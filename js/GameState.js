// Global state variables
let board = Array(8).fill().map(() => Array(8).fill(null));
let terrain = Array(8).fill().map(() => Array(8).fill({ type: "normal", owner: "neutral" }));
let gamePhase = "placement";
let playerUnits = 0, aiUnits = 0;
let playerPlaced = 0, aiPlaced = 0;
let selectedUnit = null;
let validMoves = [], validAttacks = [];
let difficulty = "normal";
let historyStack = [];
let actionRoundActive = false;
let pauseDuration = 2.0;
let placementTurn = "player";

// Snapshot & restore
function snapshot() {
    return {
        board: JSON.parse(JSON.stringify(board)),
        terrain: JSON.parse(JSON.stringify(terrain)),
        playerUnits, aiUnits, playerPlaced, aiPlaced,
        gamePhase, selectedUnit, validMoves, validAttacks
    };
}

function restoreState(state) {
    board = state.board.map(row => row.map(cell => cell ? new Unit(cell.type, cell.owner) : null));
    terrain = state.terrain;
    playerUnits = state.playerUnits; aiUnits = state.aiUnits;
    playerPlaced = state.playerPlaced; aiPlaced = state.aiPlaced;
    gamePhase = state.gamePhase;
    selectedUnit = state.selectedUnit;
    validMoves = state.validMoves; validAttacks = state.validAttacks;
    renderBoard(); updateUI(); clearHighlights();
    if (selectedUnit && gamePhase === "battle" && !actionRoundActive) highlightActions();
    if (gamePhase === "battle" && !actionRoundActive && !checkWin()) startActionRound();
}

function pushHistory() {
    historyStack.push(snapshot());
    if (historyStack.length > 20) historyStack.shift();
}

function killUnit(r, c, owner) {
    if (board[r][c] && board[r][c].owner === owner) {
        if (owner === "player") playerUnits--; else aiUnits--;
        board[r][c] = null;
    }
}

function checkWin() {
    let pTerritory = 0, aTerritory = 0;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        if (terrain[i][j].owner === "player") pTerritory++;
        if (terrain[i][j].owner === "ai") aTerritory++;
    }
    if (pTerritory >= 33 || aiUnits === 0) return "player";
    if (aTerritory >= 33 || playerUnits === 0) return "ai";
    return null;
}

function endGame(winner) {
    if (gamePhase !== "battle") return;
    gamePhase = "ended";
    let msg = winner === "player" ? "🏆 VICTOIRE STRATÉGIQUE ! 🏆" : "💀 DÉFAITE ... HONORABLE 💀";
    document.getElementById('victoryMsg').innerHTML = msg;
    document.getElementById('statsMsg').innerHTML = `Territoires : ${document.getElementById('territoryCount').innerText}<br>Unités IA : ${aiUnits}`;
    document.getElementById('victoryModal').classList.remove('hidden');
}