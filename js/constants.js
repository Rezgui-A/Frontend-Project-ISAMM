// Special cells (bonus / trap)
const specialMap = {
    "1,2": "bonus-attack", "2,5": "bonus-defense", "5,3": "trap", "6,6": "trap",
    "3,3": "bonus-attack", "4,6": "bonus-defense", "7,1": "trap"
};

function initTerrain(terrain) {
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++) {
            let key = i + "," + j;
            terrain[i][j] = { type: specialMap[key] || "normal", owner: "neutral" };
        }
}