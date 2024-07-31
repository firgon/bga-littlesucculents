let lineStock;

function initLineStock() {
    lineStock = new LineDiceStock(diceManager, document.getElementById('line-stock'), {
        sort: sortFunction('type', 'type_arg')
    });
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => {
        logDiv = document.getElementById('line-stock-last-selection-change');
        if (logDiv) {
            logDiv.innerHTML = `<br>selection = ${JSON.stringify(selection)},<br>lastChange = ${JSON.stringify(lastChange)}`;
        }
    };
    lineStock.onDieClick = (die) => {
        logDiv = document.getElementById('line-stock-last-click');
        if (logDiv) {
            logDiv.innerHTML = `<br>clicked die = ${JSON.stringify(die)}`;
        }
    };

    // add dice
    lineStock.addDice([
        { id: getDieId(), type: 0, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 0, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 0, type_arg: 12, location: 'table', location_arg: 0 },
        { id: getDieId(), type: 0, type_arg: 9, location: 'table', location_arg: 0 },
    ]);
}

function selectionTypeChange(type) {
    lineStock.setSelectionMode(type);
}

function setSelectableDice(all) {
    lineStock.setSelectableDice(lineStock.getDice().filter((die, index) => all ? true : index % 2));
}

function addDieToLineStockWithAnimation(fromElement, customAnimation) {
    const animationSettings = {
        fromElement: fromElement,
        originalSide: 'back'
    };

    if (customAnimation) {
        animationSettings.animation = new BgaAnimation(stockSlideWithDoubleLoopAnimation, {});
    }

    lineStock.addDie(
        { id: getDieId(), type: 0 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0 },
        animationSettings
    );
}

function addDieToLineStockFromVoidStock() {
    const die = { id: getDieId(), type: 0 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0 }
    voidStock.addDie({ id: die.id }, undefined, { remove: false, });
    lineStock.addDie(die);
}
