class Unit {
    constructor(type, owner) {
        this.type = type;
        this.owner = owner;
        if (type === "Soldier") { this.hp = 4; this.strength = 3; this.defense = 2; this.moveRange = 1; this.symbol = "⚔️"; }
        else if (type === "Cavalier") { this.hp = 3; this.strength = 2; this.defense = 1; this.moveRange = 2; this.symbol = "🐎"; }
        else { this.hp = 5; this.strength = 4; this.defense = 3; this.moveRange = 1; this.symbol = "💥"; }
    }
}