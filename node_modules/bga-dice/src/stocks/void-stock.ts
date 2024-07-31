interface AddDieToVoidStockSettings extends AddDieSettings {
    /**
     * Removes the die after adding.
     * Set to false if you want to add the die to the void to stock to animate it to another stock just after.
     * Default true
     */
    remove?: boolean;
}

/**
 * A stock to make dice disappear (to automatically remove disdieed dice, or to represent a bag)
 */
class VoidDiceStock extends DiceStock {

    /**
     * @param manager the die manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: DiceManager, protected element: HTMLElement) {
        super(manager, element);
        element.classList.add('bga-dice_void-stock');
    }

    /**
     * Add a die to the stock.
     *
     * @param die the die to add  
     * @param animation a `DieAnimation` object
     * @param settings a `AddDieToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    public addDie(die: BgaDie, animation?: DieAnimation, settings?: AddDieToVoidStockSettings): Promise<boolean> {
        let promise = super.addDie(die, animation, settings);

        // center the element
        const dieElement = this.getDieElement(die);
        const originalLeft = dieElement.style.left;
        const originalTop = dieElement.style.top;
        dieElement.style.left = `${(this.element.clientWidth - dieElement.clientWidth) / 2}px`;
        dieElement.style.top = `${(this.element.clientHeight - dieElement.clientHeight) / 2}px`;

        if (!promise) {
            console.warn(`VoidStock.addDie didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        if (settings?.remove ?? true) {
            return promise.then<boolean>(result => {
                this.removeDie(die);
                return result;
            });
        } else {
            dieElement.style.left = originalLeft;
            dieElement.style.top = originalTop;
            return promise;
        }
    }
}