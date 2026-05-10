async function aiTurn() {
    if (gamePhase !== "battle" || currentTurn !== "ai") return;
    document.getElementById('turnText').innerHTML = "🤖 IA RÉFLÉCHIT ...";
    await new Promise(r => setTimeout(r, 300));
    let actions = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (board[i][j] && board[i][j].owner === "ai") {
        let unit = board[i][j];
        let { moves, attacks } = getValidUnitActions(i, j, unit);
        for (let [mx, my] of moves) {
            let score = 8 + (terrain[mx][my].type === "bonus-attack" ? 6 : terrain[mx][my].type === "bonus-defense" ? 5 : 0) - (terrain[mx][my].type === "trap" ? 22 : 0);
            actions.push({ score, from: { r: i, c: j }, to: { r: mx, c: my }, type: "move" });
        }
        for (let [ax, ay] of attacks) {
            let target = board[ax][ay];
            let score = 32 + (target ? (target.type === "Tank" ? 42 : target.type === "Soldier" ? 24 : 18) : 0);
            actions.push({ score, from: { r: i, c: j }, to: { r: ax, c: ay }, type: "attack" });
        }
    }
    if (actions.length === 0) {
        addFloatingMsg("IA : aucune action possible, passe son tour", "#ffaa66");
        await new Promise(r => setTimeout(r, 1000));
        switchTurn();
        return;
    }
    if (difficulty === "hard") actions.sort((a, b) => b.score - a.score);
    else actions.sort((a, b) => (b.score - a.score) + Math.random() * 6);
    let best = actions[0];
    let unitName = board[best.from.r][best.from.c].type;
    let targetCell = best.type === "move" ? `déplacement en (${best.to.r},${best.to.c})` : `attaque sur (${best.to.r},${best.to.c})`;
    addFloatingMsg(`IA ${unitName} → ${targetCell}`, "#ffffaa", 200, 200);
    await executeAction("ai", best);
    let win = checkWin();
    if (win) endGame(win);
    else switchTurn();
}