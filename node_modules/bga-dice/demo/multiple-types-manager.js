let diceManager;

class ColoredDie6 extends BgaDie6 {
    color;

    constructor(color) {
        super({ borderRadius: 12 });
        this.color = color;
    }

    setupDieDiv(die, element) {
        super.setupDieDiv(die, element);
        element.classList.add('colored-die');
        element.dataset.color=''+this.color;
    }

    setupFaceDiv(die, element, face) {

    }
}

class KoTDie6 extends BgaDie6 {
    size = 80;

    constructor() {
        super({ borderRadius: 12 });
    }

    setupDieDiv(die, element) {
        super.setupDieDiv(die, element);
        element.classList.add('kot-die6');
    }

    setupFaceDiv(die, element, face) {

    }
}

class KoTDie4 extends BgaDie4 {
    size = 150;

    constructor() {
        super();
    }

    setupDieDiv(die, element) {
        super.setupDieDiv(die, element);
        element.classList.add('kot-die4');
    }

    setupFaceDiv(die, element, face) {
        super.setupFaceDiv(die, element, face);
    }
}

function initManager() {
    diceManager = new DiceManager(game, {
        dieTypes: {
            'white': new ColoredDie6(0),
            'red': new ColoredDie6(1),
            'yellow': new ColoredDie6(2),
            'green': new ColoredDie6(3),
            'blue': new ColoredDie6(4),
            'kot6': new KoTDie6(),
            'kot4': new KoTDie4(),
        },
    });
}

let dieId = 1;
function getDieId() {
    return dieId++;
}