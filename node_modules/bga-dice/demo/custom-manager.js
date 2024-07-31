let diceManager;

function initManager() {
    diceManager = new DiceManager(game, {
        dieTypes: {
            'takenokolor': new TakenokolorDie(),
        },
    });
}

let dieId = 1;
function getDieId() {
    return dieId++;
}