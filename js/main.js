function newGame() {
    board = Array(8).fill().map(() => Array(8).fill(null));
    initTerrain(terrain);
    gamePhase = "placement";
    playerUnits = 0; aiUnits = 0; playerPlaced = 0; aiPlaced = 0;
    selectedUnit = null; validMoves = []; validAttacks = [];
    historyStack = [];
    placementTurn = "player";
    actionRoundActive = false;
    document.getElementById('placementControls').style.display = 'flex';
    renderBoard();
    updateUI();
}

window.onload = () => {
    newGame();
    document.getElementById('restartGameBtn').onclick = () => newGame();
    document.getElementById('undoBtn').onclick = undoMove;
    document.getElementById('saveBtn').onclick = saveGame;
    document.getElementById('loadBtn').onclick = loadGame;
    document.getElementById('settingsBtn').onclick = () => document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('closeSettings').onclick = () => {
        difficulty = document.getElementById('difficultySelect').value;
        let val = parseFloat(document.getElementById('pauseAfterAction').value);
        if (!isNaN(val) && val >= 0.5) pauseDuration = val;
        document.getElementById('settingsModal').classList.add('hidden');
    };
    document.getElementById('closeVictory').onclick = () => {
        document.getElementById('victoryModal').classList.add('hidden');
        newGame();
    };
    window.unitType = "Soldier";
    document.getElementById('placeSoldierBtn').onclick = () => window.unitType = "Soldier";
    document.getElementById('placeCavalierBtn').onclick = () => window.unitType = "Cavalier";
    document.getElementById('placeTankBtn').onclick = () => window.unitType = "Tank";
};