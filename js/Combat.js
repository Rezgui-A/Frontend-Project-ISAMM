// Special cell effect: when a unit lands on a cell, roll a die and apply effect
function applySpecialCellEffect(unit, cellType) {
    if (cellType === "normal") return;
    let roll = Math.floor(Math.random() * 6) + 1;
    addFloatingMsg(`🎲 Effet case spéciale : ${roll}`, "#ffcc88", 140, 140);
    if (cellType === "bonus-attack") {
        if (roll <= 2) {
            unit.attackBonus += 1;
            addFloatingMsg(`+1 ATTAQUE permanente !`, "#aaffaa");
        } else if (roll <= 4) {
            unit.hp = Math.min(unit.hp + 2, unit.maxHp);
            addFloatingMsg(`+2 PV soignés`, "#aaffaa");
        } else {
            unit.strength += 1;
            addFloatingMsg(`+1 FORCE permanente !`, "#aaffaa");
        }
    } else if (cellType === "bonus-defense") {
        if (roll <= 2) {
            unit.defenseBonus += 1;
            addFloatingMsg(`+1 DÉFENSE permanente !`, "#aaffaa");
        } else if (roll <= 4) {
            unit.hp = Math.min(unit.hp + 2, unit.maxHp);
            addFloatingMsg(`+2 PV soignés`, "#aaffaa");
        } else {
            unit.defense += 1;
            addFloatingMsg(`+1 DÉFENSE de base !`, "#aaffaa");
        }
    } else if (cellType === "trap") {
        if (roll <= 2) {
            unit.hp -= 2;
            addFloatingMsg(`PIÈGE : -2 PV !`, "#ff8888");
        } else if (roll <= 4) {
            unit.hp -= 1;
            addFloatingMsg(`PIÈGE : -1 PV`, "#ffaa88");
        } else {
            addFloatingMsg(`PIÈGE évité !`, "#aaffaa");
        }
        if (unit.hp <= 0) killUnit(findUnitPosition(unit).r, findUnitPosition(unit).c, unit.owner);
    }
}

function findUnitPosition(unit) {
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            if (board[i][j] === unit) return { r: i, c: j };
    return null;
}

async function resolveCombat(attacker, defender, aPos, dPos) {
    let attackBonus = attacker.attackBonus;
    let defendBonus = defender.defenseBonus;
    let aRoll = Math.floor(Math.random() * 6) + 1;
    let dRoll = Math.floor(Math.random() * 6) + 1;
    let aTotal = aRoll + attacker.strength + attackBonus;
    let dTotal = dRoll + defender.defense + defendBonus;
    addFloatingMsg(`🎲 Attaque: ${aTotal} (${aRoll}+${attacker.strength}+${attackBonus}) vs Défense: ${dTotal} (${dRoll}+${defender.defense}+${defendBonus})`, "#ffcc88", 140, 140);
    if (aTotal > dTotal) {
        // Defender dies, attacker moves in
        if (defender.owner === "player") playerUnits--; else aiUnits--;
        board[dPos.r][dPos.c] = null;
        addFloatingMsg("UNITÉ DÉTRUITE!", "#ff7777", 140, 140);
        terrain[dPos.r][dPos.c].owner = attacker.owner;
        board[aPos.r][aPos.c] = null;
        board[dPos.r][dPos.c] = attacker;
        // Apply special cell effect on the new cell
        applySpecialCellEffect(attacker, terrain[dPos.r][dPos.c].type);
        return true;
    } else {
        addFloatingMsg("Attaque repoussée!", "white");
        return false;
    }
}

function getValidUnitActions(r, c, unit) {
    let moves = [], attacks = [];
    if (unit.type === "Cavalier") {
        for (let dir of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            for (let step = 1; step <= unit.moveRange; step++) {
                let nr = r + dir[0] * step, nc = c + dir[1] * step;
                if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                if (board[nr][nc]) {
                    if (board[nr][nc].owner !== unit.owner) attacks.push([nr, nc]);
                    break;
                } else moves.push([nr, nc]);
            }
        }
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if ((dr !== 0 || dc !== 0) && Math.abs(dr) + Math.abs(dc) <= 2) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        if (!board[nr][nc]) moves.push([nr, nc]);
                        else if (board[nr][nc].owner !== unit.owner) attacks.push([nr, nc]);
                    }
                }
            }
        }
    }
    return { moves, attacks };
}

async function executeAction(owner, action) {
    if (action.type === "move") {
        let from = action.from, to = action.to;
        let unit = board[from.r][from.c];
        if (!unit || unit.owner !== owner) return false;
        pushHistory();
        addFloatingMsg(`${owner === "player" ? "Vous" : "IA"} déplace ${unit.type}`, "#aaffcc");
        board[to.r][to.c] = unit;
        board[from.r][from.c] = null;
        terrain[to.r][to.c].owner = owner;
        // Apply special cell effect after moving
        applySpecialCellEffect(unit, terrain[to.r][to.c].type);
        renderBoard(); clearSelected();
        return true;
    } else if (action.type === "attack") {
        let from = action.from, to = action.to;
        let attacker = board[from.r][from.c];
        let defender = board[to.r][to.c];
        if (!attacker || attacker.owner !== owner || !defender) return false;
        pushHistory();
        addFloatingMsg(`${owner === "player" ? "Vous" : "IA"} attaque ${defender.type}`, "#ffaa88");
        await resolveCombat(attacker, defender, { r: from.r, c: from.c }, { r: to.r, c: to.c });
        renderBoard(); clearSelected();
        return true;
    }
    return false;
}