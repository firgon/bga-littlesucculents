let lineStock;

function initLineStock() {
    lineStock = new LineDiceStock(diceManager, document.getElementById('line-stock'), {
        //sort: sortFunction('type', 'type_arg')
    });
    /*lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => {
        logDiv = document.getElementById('line-stock-last-selection-change');
        if (logDiv) {
            logDiv.innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`;
        }
    }*/

    // add dice
    lineStock.addDice([
        { id: getDieId(), type: 'white', face: 2, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'white', face: 2, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'blue', face: 5, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'red', face: 1, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'yellow', face: 6, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'green', face: 4, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'kot4', face: 3, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 'kot6', face: 3, location: 'table', location_arg: 0 },
    ]);
}

function roll(effect, changeValue) {
    const dice = lineStock.getDice();
    if (changeValue) {
        dice.forEach(die => die.face = Math.floor(Math.random() * diceManager.getDieType(die).facesCount) + 1);
    }
    lineStock.rollDice(dice, {
        effect,
        duration: [800, 1200]
    });
}

function change() {
    const dice = lineStock.getDice();
    dice.forEach(die => die.value = Math.floor(Math.random() * 6) + 1);
    lineStock.changeDice(dice);
}