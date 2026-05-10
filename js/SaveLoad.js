function saveGame() {
    localStorage.setItem('conquete_save', JSON.stringify(snapshot()));
    addFloatingMsg("Partie sauvegardée", "#8effaa");
}

function loadGame() {
    let saved = localStorage.getItem('conquete_save');
    if (saved) {
        let state = JSON.parse(saved);
        restoreState(state);
        addFloatingMsg("Chargement réussi", "#aaffaa");
    } else {
        addFloatingMsg("Aucune sauvegarde", "#ffaa88");
    }
}

function undoMove() {
    if (gamePhase === "battle" && !actionRoundActive && historyStack.length) {
        let last = historyStack.pop();
        restoreState(last);
        addFloatingMsg("Annulation réussie", "#8effff");
    } else {
        addFloatingMsg("Annulation impossible", "#ffaa88");
    }
}