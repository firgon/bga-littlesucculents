let lineStock;

function initLineStock() {
    lineStock = new LineDiceStock(diceManager, document.getElementById('line-stock'), {
        sort: sortFunction('type', 'type_arg'),
        direction: 'column',
        center: true,
    });

    // add dice
    lineStock.addDice([
        { id: getDieId(), type: 'takenokolor', type_arg: 2, location: 'table', location_arg: 0, color: '#FBB0D0' }, // pink
        { id: getDieId(), type: 'takenokolor', type_arg: 5, location: 'table', location_arg: 0, color: '#F9EC29' }, // yellow
        { id: getDieId(), type: 'takenokolor', type_arg: 12, location: 'table', location_arg: 0, color: '#75D4FE' }, // blue
        { id: getDieId(), type: 'takenokolor', type_arg: 9, location: 'table', location_arg: 0, color: '#24EA57' }, // green
    ]);
}

function roll() {
    const dice = lineStock.getDice();
    dice.forEach(die => die.value = Math.floor(Math.random() * 6) + 1);
    lineStock.rollDice(dice, {
        effect: 'rollIn',
        duration: [800, 1200]
    });
}