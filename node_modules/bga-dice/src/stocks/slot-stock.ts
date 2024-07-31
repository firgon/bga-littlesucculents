interface SlotStockSettings extends LineStockSettings {
    /**
     * The ids for the slots (can be number or string)
     */
    slotsIds: SlotId[];

    /**
     * The classes to apply to each slot
     */
    slotClasses?: string[];

    /**
     * How to place the die on a slot automatically
     */
    mapDieToSlot?: (die: BgaDie) => SlotId;
}

type SlotId = number | string;

interface AddDieToSlotSettings extends AddDieSettings {
    /**
     * The slot to place the die on.
     */
    slot?: SlotId;
}

/**
 * A stock with fixed slots (some can be empty)
 */
class SlotDiceStock extends LineDiceStock {
    protected slotsIds: SlotId[] = [];
    protected slots: HTMLDivElement[] = [];
    protected slotClasses: string[];
    protected mapDieToSlot?: (die: BgaDie) => SlotId;

    /**
     * @param manager the die manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(protected manager: DiceManager, protected element: HTMLElement, settings: SlotStockSettings) {
        super(manager, element, settings);
        element.classList.add('bga-dice_slot-stock');

        this.mapDieToSlot = settings.mapDieToSlot;
        this.slotsIds = settings.slotsIds ?? [];
        this.slotClasses = settings.slotClasses ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    protected createSlot(slotId: SlotId) {
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        this.slots[slotId].classList.add(...['slot', ...this.slotClasses]);
    }

    /**
     * Add a die to the stock.
     *
     * @param die the die to add  
     * @param animation a `DieAnimation` object
     * @param settings a `AddDieToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    public addDie(die: BgaDie, animation?: DieAnimation, settings?: AddDieToSlotSettings): Promise<boolean> {
        const slotId = settings?.slot ?? this.mapDieToSlot?.(die);
        if (slotId === undefined) {
            throw new Error(`Impossible to add die to slot : no SlotId. Add slotId to settings or set mapDieToSlot to SlotDie constructor.`);
        }
        if (!this.slots[slotId]) {
            throw new Error(`Impossible to add die to slot "${slotId}" : slot "${slotId}" doesn't exists.`);
        }

        const newSettings = {
            ...settings,
            forceToElement: this.slots[slotId],
        };
        return super.addDie(die, animation, newSettings);
    }

    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     * 
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    public setSlotsIds(slotsIds: SlotId[]) {
        if (slotsIds.length == this.slotsIds.length && slotsIds.every((slotId, index) => this.slotsIds[index] === slotId)) {
            // no change
            return;
        }

        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    protected canAddDie(die: BgaDie, settings?: AddDieToSlotSettings) {
        if (!this.contains(die)) {
            return true;
        } else {
            const currentDicelot = (this.getDieElement(die).closest('.slot') as HTMLDivElement).dataset.slotId;
            const slotId = settings?.slot ?? this.mapDieToSlot?.(die);
            return currentDicelot != slotId;
        }
    }

    /**
     * Swap dice inside the slot stock.
     * 
     * @param dice the dice to swap
     * @param settings for `updateInformations` and `selectable`
     */
    public swapDice(dice: BgaDie[], settings?: AddDieSettings) {
        if (!this.mapDieToSlot) {
            throw new Error('You need to define SlotStock.mapDieToSlot to use SlotStock.swapDice');
        }

        const promises: Promise<boolean>[] = [];

        const elements = dice.map(die => this.manager.getDieElement(die));
        const elementsRects = elements.map(element => element.getBoundingClientRect());
        const cssPositions = elements.map(element => element.style.position);

        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(element => element.style.position = 'absolute');

        dice.forEach((die, index) => {
            const dieElement = elements[index];

            let promise: Promise<boolean>;
            const slotId = this.mapDieToSlot?.(die);
            this.slots[slotId].appendChild(dieElement);
            dieElement.style.position = cssPositions[index];

            const dieIndex = this.dice.findIndex(c => this.manager.getId(c) == this.manager.getId(die));
            if (dieIndex !== -1) {
                this.dice.splice(dieIndex, 1, die);
            }
    
            if (settings?.updateInformations ?? true) { // after splice/push
                this.manager.updateDieInformations(die);
            }

            this.removeSelectionClassesFromElement(dieElement);
            promise = this.animationFromElement(dieElement, elementsRects[index], {});
            
            if (!promise) {
                console.warn(`Dicetock.animationFromElement didn't return a Promise`);
                promise = Promise.resolve(false);
            }

            promise.then(() => this.setSelectableDie(die, settings?.selectable ?? true));

            promises.push(promise);
        });

        return Promise.all(promises);
    }
}