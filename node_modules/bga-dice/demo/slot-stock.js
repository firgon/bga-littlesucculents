let slotStock;
let slotStockDie1;
let slotStockDie2;

function initSlotStock() {
    slotStock = new SlotDiceStock(diceManager, document.getElementById('slot-stock'), {
        slotsIds: ['A', 'B', 'C'],
        slotClasses: ['mygame-slot'],
        mapDieToSlot: (die) => die.location,
    });

    slotStockDie1 = { id: getDieId(), type: 0, type_arg: 2, location: 'A', location_arg: 0 };
    slotStockDie2 = { id: getDieId(), type: 0, type_arg: 5, location: 'C', location_arg: 0 };

    // add dice
    slotStock.addDice([
        slotStockDie1,
        slotStockDie2,
    ]);
}

function swapSlotStockDice() {
    if (slotStockDie1.location == 'A') {
        slotStockDie1.location = 'C';
        slotStockDie2.location = 'A';
    } else {
        slotStockDie1.location = 'A';
        slotStockDie2.location = 'C';
    }

    slotStock.swapDice([
        slotStockDie1,
        slotStockDie2,
    ]);
}
