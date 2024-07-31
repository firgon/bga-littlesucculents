/**
 * A stock with manually placed dice
 */
class ManualPositionDiceStock extends DiceStock {

    /**
     * @param manager the die manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: DiceManager, protected element: HTMLElement, settings: DieStockSettings, protected updateDisplay: (element: HTMLElement, dice: BgaDie[], lastDie: BgaDie, stock: ManualPositionDiceStock) => any) {
        super(manager, element, settings);
        element.classList.add('bga-dice_manual-position-stock');
    }

    /**
     * Add a die to the stock.
     *
     * @param die the die to add  
     * @param animation a `DieAnimation` object
     * @param settings a `AddDiceettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    public addDie(die: BgaDie, animation?: DieAnimation, settings?: AddDieSettings): Promise<boolean> {
        const promise = super.addDie(die, animation, settings);
        this.updateDisplay(this.element, this.getDice(), die, this);
        return promise;
    }

    public dieRemoved(die: BgaDie) {
        super.dieRemoved(die);
        this.updateDisplay(this.element, this.getDice(), die, this);
    }
}