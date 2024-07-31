let voidStock;

function initVoidStock() {
    voidStock = new VoidDiceStock(diceManager, document.getElementById('void-stock'));
}

function addDieToVoidStock(fromElement) {
    if (lineStock.isEmpty()) {
        throw new Error('no die in LineStock');
    }

    const die = lineStock.getDice()[0];
    voidStock.addDie(die);
}
