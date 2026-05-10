function addFloatingMsg(msg, color, x = 150, y = 150) {
    let div = document.createElement('div');
    div.className = 'floating-damage';
    div.innerText = msg;
    div.style.color = color;
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 800);
}

function updateUI() {
    let pTerritory = 0;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (terrain[i][j].owner === "player") pTerritory++;
    document.getElementById('territoryCount').innerText = pTerritory;
    document.getElementById('playerUnits').innerText = playerUnits;
    document.getElementById('aiUnits').innerText = aiUnits;
    if (gamePhase === "placement") {
        let msg = (playerPlaced < 5) ? `🔷 PLACEMENT (${playerPlaced}/5) - À VOUS` : "🤖 IA termine le placement...";
        document.getElementById('turnText').innerText = msg;
    } else {
        document.getElementById('turnText').innerHTML = actionRoundActive ? "🎲 LANCER LE DÉ POUR L'ACTION 🎲" : "⚔️ CLIQUEZ SUR VOTRE UNITÉ PUIS SUR UNE CASE ⚔️";
    }
}

function showDiceModalForAction(callback) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal-overlay';
    modalDiv.innerHTML = `
        <div class="dice-card">
            <h2 style="color:#b5f0ff">🎲 LANCER DE DÉ – ACTION SUIVANTE 🎲</h2>
            <div class="dice-area">
                <div class="dice" id="dicePlayer">⚡</div>
                <div class="dice" id="diceAI">🤖</div>
            </div>
            <p id="diceMessage" style="margin: 20px 0; color:#ccf;">Le vainqueur pourra jouer une action</p>
            <button id="rollDiceActionBtn" style="font-size:1.2rem; padding:10px 28px;">🔮 LANCER LES DÉS 🔮</button>
        </div>
    `;
    document.body.appendChild(modalDiv);
    const playerDie = document.getElementById('dicePlayer');
    const aiDie = document.getElementById('diceAI');
    const msgP = document.getElementById('diceMessage');
    const rollBtn = document.getElementById('rollDiceActionBtn');
    let rolled = false;
    rollBtn.onclick = async () => {
        if (rolled) return;
        rolled = true;
        rollBtn.disabled = true;
        msgP.innerHTML = "🎲 LANCEMENT ... 🎲";
        for (let i = 0; i < 20; i++) {
            let fake1 = Math.floor(Math.random() * 6) + 1;
            let fake2 = Math.floor(Math.random() * 6) + 1;
            playerDie.innerText = fake1;
            aiDie.innerText = fake2;
            playerDie.classList.add('rolling');
            aiDie.classList.add('rolling');
            await new Promise(r => setTimeout(r, 60));
        }
        playerDie.classList.remove('rolling');
        aiDie.classList.remove('rolling');
        const finalPlayer = Math.floor(Math.random() * 6) + 1;
        const finalAI = Math.floor(Math.random() * 6) + 1;
        playerDie.innerText = finalPlayer;
        aiDie.innerText = finalAI;
        let winner = null;
        if (finalPlayer > finalAI) winner = "player";
        else if (finalAI > finalPlayer) winner = "ai";
        else {
            msgP.innerHTML = `⚖️ ÉGALITÉ (${finalPlayer} vs ${finalAI}) - Relancez ! ⚖️`;
            rolled = false;
            rollBtn.disabled = false;
            return;
        }
        msgP.innerHTML = winner === "player" ? `🌟 VOUS GAGNEZ ! (${finalPlayer} vs ${finalAI}) 🌟` : `🤖 L'IA GAGNE ! (${finalAI} vs ${finalPlayer}) 🤖`;
        setTimeout(() => {
            modalDiv.remove();
            callback(winner);
        }, 1500);
    };
}

async function startActionRound() {
    if (gamePhase !== "battle") return;
    if (actionRoundActive) return;
    let winner = await new Promise(resolve => { showDiceModalForAction(resolve); });
    if (gamePhase !== "battle") return;
    if (winner === "player") {
        addFloatingMsg("🎲 Vous remportez le dé ! Choisissez une action", "#aaffff");
        actionRoundActive = false;
        updateUI();
    } else {
        addFloatingMsg("🎲 L'IA remporte le dé ! L'IA va agir...", "#ffaa88");
        actionRoundActive = true;
        updateUI();
        await aiPerformBestAction();
        let pauseMs = pauseDuration * 1000;
        await new Promise(r => setTimeout(r, pauseMs));
        let win = checkWin();
        if (win) { endGame(win); return; }
        actionRoundActive = false;
        updateUI();
        startActionRound();
    }
}

async function playerAttemptAction(from, to) {
    if (gamePhase !== "battle") return false;
    if (actionRoundActive) { addFloatingMsg("Attendez la fin du dé...", "orange"); return false; }
    let unit = board[from.r][from.c];
    if (!unit || unit.owner !== "player") return false;
    let { moves, attacks } = getValidUnitActions(from.r, from.c, unit);
    let isAttack = attacks.some(([x, y]) => x === to.r && y === to.c);
    let isMove = moves.some(([x, y]) => x === to.r && y === to.c);
    if (!isAttack && !isMove) return false;
    actionRoundActive = true;
    updateUI();
    let action = { type: isAttack ? "attack" : "move", from: from, to: to };
    let success = await executeAction("player", action, true);
    let win = checkWin();
    if (win) { endGame(win); return success; }
    let pauseMs = pauseDuration * 1000;
    await new Promise(r => setTimeout(r, pauseMs));
    actionRoundActive = false;
    updateUI();
    startActionRound();
    return success;
}

function onCellClick(r, c) {
    if (gamePhase === "placement") {
        if (playerPlaced < 5) {
            let type = window.unitType || "Soldier";
            placeUnit(r, c, type);
        }
        return;
    }
    if (gamePhase === "battle" && !actionRoundActive) {
        if (selectedUnit && (validMoves.some(([x, y]) => x === r && y === c) || validAttacks.some(([x, y]) => x === r && y === c))) {
            playerAttemptAction(selectedUnit, { r, c });
            clearSelected();
            renderBoard();
        } else if (board[r][c] && board[r][c].owner === "player") {
            clearSelected();
            selectedUnit = { r, c };
            highlightActions();
            renderBoard();
        } else {
            clearSelected();
            renderBoard();
        }
    } else if (actionRoundActive) {
        addFloatingMsg("Dé ou pause en cours... patientez", "#ffaa66");
    }
}