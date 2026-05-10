function renderBoard() {
    const container = document.getElementById('gameBoard');
    container.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            let owner = terrain[i][j].owner;
            if (owner === "player") cell.classList.add('owner-player');
            else if (owner === "ai") cell.classList.add('owner-ai');
            else cell.classList.add('owner-neutral');
            if (terrain[i][j].type === "bonus-attack") cell.classList.add('bonus-attack');
            if (terrain[i][j].type === "bonus-defense") cell.classList.add('bonus-defense');
            if (terrain[i][j].type === "trap") cell.classList.add('trap');
            let unit = board[i][j];
            if (unit) {
                let unitDiv = document.createElement('div');
                unitDiv.className = 'unit';
                unitDiv.setAttribute('data-type', unit.type);
                unitDiv.innerHTML = `${unit.symbol} ${unit.type[0]}<span class="hp">❤️${unit.hp}</span>`;
                cell.appendChild(unitDiv);
            }
            cell.addEventListener('click', (function (r, c) { return () => onCellClick(r, c); })(i, j));
            container.appendChild(cell);
        }
    }
    if (selectedUnit && gamePhase === "battle" && !actionRoundActive) highlightActions();
}

function highlightActions() {
    clearHighlights();
    if (!selectedUnit) return;
    let unit = board[selectedUnit.r][selectedUnit.c];
    if (!unit) return;
    let { moves, attacks } = getValidUnitActions(selectedUnit.r, selectedUnit.c, unit);
    validMoves = moves; validAttacks = attacks;
    moves.forEach(([r, c]) => {
        let idx = r * 8 + c;
        let cell = document.getElementById('gameBoard').children[idx];
        if (cell) cell.classList.add('valid-move');
    });
    attacks.forEach(([r, c]) => {
        let idx = r * 8 + c;
        let cell = document.getElementById('gameBoard').children[idx];
        if (cell) cell.classList.add('attack-range');
    });
}

function clearHighlights() {
    let children = document.getElementById('gameBoard').children;
    for (let i = 0; i < children.length; i++) children[i].classList.remove('valid-move', 'attack-range');
}

function clearSelected() {
    selectedUnit = null;
    validMoves = [];
    validAttacks = [];
    clearHighlights();
}