function placeUnit(row, col, type) {
    if (gamePhase !== "placement") return false;
    if (playerPlaced >= 5 && aiPlaced >= 5) return false;
    let expectedOwner = (playerPlaced === aiPlaced) ? placementTurn : (playerPlaced > aiPlaced ? "ai" : "player");
    if (expectedOwner !== "player") { addFloatingMsg("C'est à l'IA de placer", "orange"); return false; }
    let zoneValide = (expectedOwner === "player") ? (row <= 1) : (row >= 6);
    if (!zoneValide || board[row][col] !== null) return false;
    board[row][col] = new Unit(type, "player");
    terrain[row][col].owner = "player";
    playerUnits++;
    playerPlaced++;
    renderBoard();
    updateUI();
    if (playerPlaced === 5 && aiPlaced === 5) {
        gamePhase = "battle";
        document.getElementById('placementControls').style.display = 'none';
        actionRoundActive = false;
        startActionRound();
        return true;
    }
    placementTurn = "ai";
    updateUI();
    setTimeout(() => aiPlacement(), 300);
    return true;
}

function aiPlacement() {
    if (gamePhase !== "placement") return;
    if (playerPlaced >= 5 && aiPlaced >= 5) return;
    let expectedOwner = (playerPlaced === aiPlaced) ? placementTurn : (playerPlaced > aiPlaced ? "ai" : "player");
    if (expectedOwner !== "ai") return;
    let available = [];
    for (let i = 6; i < 8; i++) for (let j = 0; j < 8; j++) if (!board[i][j]) available.push([i, j]);
    if (available.length) {
        let [r, c] = available[Math.floor(Math.random() * available.length)];
        let types = ["Soldier", "Cavalier", "Tank"];
        let chosen = types[Math.floor(Math.random() * 3)];
        board[r][c] = new Unit(chosen, "ai");
        terrain[r][c].owner = "ai";
        aiUnits++;
        aiPlaced++;
        renderBoard();
        updateUI();
        if (playerPlaced === 5 && aiPlaced === 5) {
            gamePhase = "battle";
            document.getElementById('placementControls').style.display = 'none';
            actionRoundActive = false;
            startActionRound();
            return;
        }
        placementTurn = "player";
        updateUI();
    } else {
        aiPlaced = 5;
        if (playerPlaced === 5) {
            gamePhase = "battle";
            document.getElementById('placementControls').style.display = 'none';
            startActionRound();
        }
    }
}