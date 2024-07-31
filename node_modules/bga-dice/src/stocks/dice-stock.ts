interface DieStockSettings {
    /**
     * Indicate the die sorting (unset means no sorting, new dice will be added at the end).
     * For example, use `sort: sortFunction('type', '-type_arg')` to sort by type then type_arg (in reversed order if prefixed with `-`). 
     * Be sure you typed the values correctly! Else '11' will be before '2'.
     */
    sort?: SortFunction;

    /**
     * Perspective effect on Stock elements. Default 1000px. Can be overriden on each stock.
     */
    perspective?: number | null;

    /**
     * The class to apply to selectable dice. Use class from manager is unset.
     */
    selectableDieClass?: string | null;

    /**
     * The class to apply to selectable dice. Use class from manager is unset.
     */
    unselectableDieClass?: string | null;

    /**
     * The class to apply to selected dice. Use class from manager is unset.
     */
    selectedDieClass?: string | null;
}

interface AddDieSettings {
    /**
     * If the die will be on its visible side on the stock
     */
    visible?: boolean;

    forceToElement?: HTMLElement;

    /**
     * Force die position. Default to end of list. Do not use if sort is defined, as it will override it.
     */
    index?: number;
    
    /**
     * If the die need to be updated. Default true, will flip the die if needed.
     */
    updateInformations?: boolean;
    
    /**
     * Set if the die is selectable. Default is true, but will be ignored if the stock is not selectable.
     */
    selectable?: boolean;
}
interface RollDieSettings {    
    /**
     * Set the dice roll effect. Default 'rollIn';
     */
    effect?: DiceRollEffect;

    /**
     * Duration. A number (if fixed), or an array of 2, and it will be a random value between the 2 values.
     * Default 1000.
     */
    duration: number | number[];
}

type DiceSelectionMode = 'none' | 'single' | 'multiple';
type DiceRollEffect = 'rollIn' | 'rollInBump' | 'rollOutPauseAndBack' | 'rollOutBumpPauseAndBack' | 'turn' | 'none';

/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
class DiceStock {
    protected dice: BgaDie[] = [];
    protected selectedDice: BgaDie[] = [];
    protected selectionMode: DiceSelectionMode = 'none';
    protected sort?: SortFunction; 

    /**
     * Called when selection change. Returns the selection.
     * 
     * selection: the selected dice of the stock  
     * lastChange: the last change on selection die (can be selected or unselected)
     */
    public onSelectionChange?: (selection: BgaDie[], lastChange: BgaDie | null) => void;

    /**
     * Called when selection change. Returns the clicked die.
     * 
     * die: the clicked die (can be selected or unselected)
     */
    public onDieClick?: (die: BgaDie) => void;

    /**
     * @param manager the die manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: DiceManager, protected element: HTMLElement, private settings?: DieStockSettings) {
        manager.addStock(this);
        element?.classList.add('bga-dice_die-stock'/*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        const perspective = this.getPerspective();
        element.style.setProperty('--perspective', perspective ? `${perspective}px` : 'unset');
        this.bindClick();

        this.sort = settings?.sort;
    }

    /**
     * @returns the dice on the stock
     */
    public getDice(): BgaDie[] {
        return this.dice.slice();
    }

    /**
     * @returns if the stock is empty
     */
    public isEmpty(): boolean {
        return !this.dice.length;
    }

    /**
     * @returns the selected dice
     */
    public getSelection(): BgaDie[] {
        return this.selectedDice.slice();
    }

    /**
     * @returns the selected dice
     */
    public isSelected(die: BgaDie): boolean {
        return this.selectedDice.some(c => this.manager.getId(c) == this.manager.getId(die));
    }

    /**
     * @param die a die  
     * @returns if the die is present in the stock
     */
    public contains(die: BgaDie): boolean {
        return this.dice.some(c => this.manager.getId(c) == this.manager.getId(die));
    }

    /**
     * @param die a die in the stock
     * @returns the HTML element generated for the die
     */
    public getDieElement(die: BgaDie): HTMLElement {
        return this.manager.getDieElement(die);
    }

    /**
     * Checks if the die can be added. By default, only if it isn't already present in the stock.
     * 
     * @param die the die to add
     * @param settings the addDie settings
     * @returns if the die can be added
     */
    protected canAddDie(die: BgaDie, settings?: AddDieSettings) {
        return !this.contains(die);
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
        if (!this.canAddDie(die, settings)) {
            return Promise.resolve(false);
        }

        let promise: Promise<boolean>;

        // we check if die is in a stock
        const originStock = this.manager.getDieStock(die);

        const index = this.getNewDieIndex(die);
        const settingsWithIndex: AddDieSettings = {
            index,
            ...(settings ?? {})
        };

        const updateInformations = settingsWithIndex.updateInformations ?? true;

        if (originStock?.contains(die)) {
            let element = this.getDieElement(die);
            promise = this.moveFromOtherStock(die, element, { ...animation, fromStock: originStock,  }, settingsWithIndex);
        } else if (animation?.fromStock && animation.fromStock.contains(die)) {
            let element = this.getDieElement(die);
            promise = this.moveFromOtherStock(die, element, animation, settingsWithIndex);
        } else {
            const element = this.manager.createDieElement(die);
            promise = this.moveFromElement(die, element, animation, settingsWithIndex);
        }

        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.dice.splice(index, 0, die);
        } else {
            this.dice.push(die);
        }

        if (updateInformations) { // after splice/push
            this.manager.updateDieInformations(die);
        }

        if (!promise) {
            console.warn(`Dicetock.addDie didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(() => this.setSelectableDie(die, settingsWithIndex.selectable ?? true));
        }

        return promise;
    }

    protected getNewDieIndex(die: BgaDie): number | undefined {
        if (this.sort) {
            const otherDice = this.getDice();
            for (let i = 0; i<otherDice.length; i++) {
                const otherDie = otherDice[i];

                if (this.sort(die, otherDie) < 0) {
                    return i;
                }
            }
            return otherDice.length;
        } else {
            return undefined;
        }
    }

    protected addDieElementToParent(dieElement: HTMLElement, settings?: AddDieSettings) {
        const parent = settings?.forceToElement ?? this.element;

        if (settings?.index === null || settings?.index === undefined || !parent.children.length || settings?.index >= parent.children.length) {
            parent.appendChild(dieElement);
        } else {
            parent.insertBefore(dieElement, parent.children[settings.index]);
        }
    }

    protected moveFromOtherStock(die: BgaDie, dieElement: HTMLElement, animation: DieAnimation, settings?: AddDieSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        const element = animation.fromStock.contains(die) ? this.manager.getDieElement(die) : animation.fromStock.element;
        const fromRect = element.getBoundingClientRect();

        this.addDieElementToParent(dieElement, settings);

        this.removeSelectionClassesFromElement(dieElement);

        promise = this.animationFromElement(dieElement, fromRect, {
            originalSide: animation.originalSide, 
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the die was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeDie(die);
        }
        
        if (!promise) {
            console.warn(`Dicetock.moveFromOtherStock didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        return promise;
    }

    protected moveFromElement(die: BgaDie, dieElement: HTMLElement, animation: DieAnimation, settings?: AddDieSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        this.addDieElementToParent(dieElement, settings);
    
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(dieElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide, 
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeDie(die);
            } else if (animation.fromElement) {
                promise = this.animationFromElement(dieElement,  animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide, 
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        } else {
            promise = Promise.resolve(false);
        }
        
        if (!promise) {
            console.warn(`Dicetock.moveFromElement didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        return promise;
    }

    /**
     * Add an array of dice to the stock.
     * 
     * @param dice the dice to add
     * @param animation a `DieAnimation` object
     * @param settings a `AddDiceettings` object
     * @param shift if number, the number of milliseconds between each die. if true, chain animations
     */
    public async addDice(dice: BgaDie[], animation?: DieAnimation, settings?: AddDieSettings, shift: number | boolean = false): Promise<boolean> {
        if (!this.manager.animationsActive()) {
            shift = false;
        }
        let promises: Promise<boolean>[] = [];

        if (shift === true) {
            if (dice.length) {
                const result = await this.addDie(dice[0], animation, settings);
                const others = await this.addDice(dice.slice(1), animation, settings, shift);
                return result || others;
            }
        } else if (typeof shift === 'number') {
            for (let i=0; i<dice.length; i++) {
                setTimeout(() => promises.push(this.addDie(dice[i], animation, settings)), i * shift);
            }
        } else {
            promises = dice.map(die => this.addDie(die, animation, settings));
        }

        const results = await Promise.all(promises);
        return results.some(result => result);
    }

    /**
     * Remove a die from the stock.
     * 
     * @param die die die to remove
     */
    public removeDie(die: BgaDie) {
        if (this.contains(die) && this.element.contains(this.getDieElement(die))) {
            this.manager.removeDie(die);
        }
        this.dieRemoved(die);
    }

    /**
     * Notify the stock that a die is removed.
     * 
     * @param die the die to remove
     */
    public dieRemoved(die: BgaDie) {
        const index = this.dice.findIndex(c => this.manager.getId(c) == this.manager.getId(die));
        if (index !== -1) {
            this.dice.splice(index, 1);
        }
        if (this.selectedDice.find(c => this.manager.getId(c) == this.manager.getId(die))) {
            this.unselectDie(die);
        }
    }

    /**
     * Remove a set of dice from the stock.
     * 
     * @param dice the dice to remove
     */
    public removeDice(dice: BgaDie[]) {
        dice.forEach(die => this.removeDie(die));
    }

    /**
     * Remove all dice from the stock.
     */
    public removeAll() {
        const dice = this.getDice(); // use a copy of the array as we iterate and modify it at the same time
        dice.forEach(die => this.removeDie(die));
    }

    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected dice.
     * 
     * @param selectionMode the selection mode
     * @param selectableDice the selectable dice (all if unset). Calls `setSelectableDice` method
     */
    public setSelectionMode(selectionMode: DiceSelectionMode, selectableDice?: BgaDie[]) {
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }

        this.dice.forEach(die => this.setSelectableDie(die, selectionMode != 'none'));
        this.element.classList.toggle('bga-dice_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        
        if (selectionMode === 'none') {
            this.getDice().forEach(die => this.removeSelectionClasses(die));
        } else {
            this.setSelectableDice(selectableDice ?? this.getDice());
        }
    }

    protected setSelectableDie(die: BgaDie, selectable: boolean) {
        if (this.selectionMode === 'none') {
            return;
        }

        const element = this.getDieElement(die);              
        const selectableDiceClass = this.getSelectableDieClass();
        const unselectableDiceClass = this.getUnselectableDieClass();

        if (selectableDiceClass) {
            element.classList.toggle(selectableDiceClass, selectable);
        }
        if (unselectableDiceClass) {
            element.classList.toggle(unselectableDiceClass, !selectable);
        }

        if (!selectable && this.isSelected(die)) {
            this.unselectDie(die, true);
        }
    }

    /**
     * Set the selectable class for each die.
     * 
     * @param selectableDice the selectable dice. If unset, all dice are marked selectable. Default unset.
     */
    public setSelectableDice(selectableDice?: BgaDie[]) {
        if (this.selectionMode === 'none') {
            return;
        }

        const selectableDiceIds = (selectableDice ?? this.getDice()).map(die => this.manager.getId(die));

        this.dice.forEach(die =>
            this.setSelectableDie(die, selectableDiceIds.includes(this.manager.getId(die)))
        );
    }

    /**
     * Set selected state to a die.
     * 
     * @param die the die to select
     */
    public selectDie(die: BgaDie, silent: boolean = false) {
        if (this.selectionMode == 'none') {
            return;
        }

        const element = this.getDieElement(die);

        const selectableDiceClass = this.getSelectableDieClass();
        if (!element.classList.contains(selectableDiceClass)) {
            return;
        }
        
        if (this.selectionMode === 'single') {
            this.dice.filter(c => this.manager.getId(c) != this.manager.getId(die)).forEach(c => this.unselectDie(c, true));
        }

        const selectedDiceClass = this.getSelectedDieClass();
        element.classList.add(selectedDiceClass);
        this.selectedDice.push(die);
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedDice.slice(), die);
        }
    }

    /**
     * Set unselected state to a die.
     * 
     * @param die the die to unselect
     */
    public unselectDie(die: BgaDie, silent: boolean = false) {
        const element = this.getDieElement(die);      
        const selectedDiceClass = this.getSelectedDieClass();
        element.classList.remove(selectedDiceClass);

        const index = this.selectedDice.findIndex(c => this.manager.getId(c) == this.manager.getId(die));
        if (index !== -1) {
            this.selectedDice.splice(index, 1);
        }
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedDice.slice(), die);
        }
    }

    /**
     * Select all dice
     */
    public selectAll(silent: boolean = false) {
        if (this.selectionMode == 'none') {
            return;
        }

        this.dice.forEach(c => this.selectDie(c, true));
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedDice.slice(), null);
        }
    }

    /**
     * Unelect all dice
     */
    public unselectAll(silent: boolean = false) {
        const dice = this.getDice(); // use a copy of the array as we iterate and modify it at the same time
        dice.forEach(c => this.unselectDie(c, true));
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedDice.slice(), null);
        }
    }

    protected bindClick() {
        this.element?.addEventListener('click', event => {
            const dieDiv = (event.target as HTMLElement).closest('.bga-dice_die');
            if (!dieDiv) {
                return;
            }
            const die = this.dice.find(c => this.manager.getId(c) == dieDiv.id);
            if (!die) {
                return;
            }
            this.dieClick(die);
        });
    }

    protected dieClick(die: BgaDie) {
        if (this.selectionMode != 'none') {
            const alreadySelected = this.selectedDice.some(c => this.manager.getId(c) == this.manager.getId(die));

            if (alreadySelected) {
                this.unselectDie(die);
            } else {
                this.selectDie(die);
            }
        }

        this.onDieClick?.(die);
    }

    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts. 
     * @param fromElement The HTMLElement to animate from.
     */
    protected async animationFromElement(element: HTMLElement, fromRect: DOMRect, settings: DieAnimationSettings): Promise<boolean> {
        const side = element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            const diceides = element.getElementsByClassName('die-sides')[0] as HTMLDivElement;
            diceides.style.transition = 'none';
            element.dataset.side = settings.originalSide;
            setTimeout(() => {
                diceides.style.transition = null;
                element.dataset.side = side;
            });
        }

        let animation = settings.animation;
        if (animation) {
            animation.settings.element = element;
            (animation.settings as BgaAnimationWithOriginSettings).fromRect = fromRect;
        } else {
            animation = new BgaSlideAnimation({ element, fromRect });
        }

        const result = await this.manager.animationManager.play(animation);
        return result?.played ?? false;
    }

    /**
     * @returns the perspective for this stock.
     */
    private getPerspective(): number | null {
        return this.settings?.perspective === undefined ? this.manager.getPerspective() : this.settings?.perspective;
    }

    /**
     * @returns the class to apply to selectable dice. Use class from manager is unset.
     */
    public getSelectableDieClass(): string | null {
        return this.settings?.selectableDieClass === undefined ? this.manager.getSelectableDieClass() : this.settings?.selectableDieClass;
    }

    /**
     * @returns the class to apply to selectable dice. Use class from manager is unset.
     */
    public getUnselectableDieClass(): string | null {
        return this.settings?.unselectableDieClass === undefined ?this.manager.getUnselectableDieClass() : this.settings?.unselectableDieClass;
    }

    /**
     * @returns the class to apply to selected dice. Use class from manager is unset.
     */
    public getSelectedDieClass(): string | null {
        return this.settings?.selectedDieClass === undefined ? this.manager.getSelectedDieClass() : this.settings?.selectedDieClass;
    }

    public removeSelectionClasses(die: BgaDie) {        
        this.removeSelectionClassesFromElement(this.getDieElement(die));
    }

    public removeSelectionClassesFromElement(dieElement: HTMLElement) {        
        const selectableDiceClass = this.getSelectableDieClass();
        const unselectableDiceClass = this.getUnselectableDieClass();
        const selectedDiceClass = this.getSelectedDieClass();

        dieElement.classList.remove(selectableDiceClass, unselectableDiceClass, selectedDiceClass);
    }

    protected addRollEffectToDieElement(die: BgaDie, element: HTMLElement, effect: DiceRollEffect, duration: number) {
        switch (effect) {
            case 'rollIn':
                this.manager.animationManager.play(new BgaSlideAnimation({
                    element,
                    duration,
                    transitionTimingFunction: 'ease-out',
                    fromDelta: {
                        x: 0,
                        y: (this.manager.getDieType(die).size ?? 50) * 5,
                    }
                }));
                break;
            case 'rollOutPauseAndBack':
                this.manager.animationManager.play(new BgaCumulatedAnimation({ animations: [
                    new BgaSlideToAnimation({
                        element,
                        duration,
                        transitionTimingFunction: 'ease-out',
                        fromDelta: {
                            x: 0,
                            y: (this.manager.getDieType(die).size ?? 50) * -5,
                        }
                    }),
                    new BgaPauseAnimation({}),
                    new BgaSlideToAnimation({
                        duration: 250,
                        transitionTimingFunction: 'ease-out',
                        element,
                        fromDelta: {
                            x: 0,
                            y: 0,
                        }
                    }),
                ]}));
                break;
            case 'turn':
                this.manager.animationManager.play(new BgaPauseAnimation({ duration }));
                break;
        }
    }

    public rollDice(dice: BgaDie[], settings?: RollDieSettings) {
        dice.forEach(die => this.rollDie(die, settings));
    }

    public rollDie(die: BgaDie, settings?: RollDieSettings) {
        const div = this.getDieElement(die);
        const faces = div.querySelector('.bga-dice_die-faces') as HTMLElement;

        faces.style.setProperty('--roll-duration', `0`);
        faces.clientWidth;
        faces.dataset.visibleFace = ``;
        faces.clientWidth;

        const rollEffect = settings?.effect ?? 'rollIn';
        const animate = this.manager.animationManager.animationsActive() && rollEffect !== 'none';
        let duration = settings?.duration ?? 1000;
        if (animate) {
            if (Array.isArray(duration)) {
                const diff = Math.abs(duration[1] - duration[0]);
                duration = Math.min(...duration) + Math.floor(Math.random() * diff);
            }

            if (rollEffect.includes('roll')) {
                faces.style.transform = `rotate3d(${Math.random() < 0.5 ? -1 : 1}, ${Math.random() < 0.5 ? -1 : 1}, ${Math.random() < 0.5 ? -1 : 1}, ${720 + Math.random() * 360}deg)`;
                faces.clientWidth;
            }

            this.addRollEffectToDieElement(die, div, rollEffect, duration);
        }

        faces.style.setProperty('--roll-duration', `${animate ? duration : 0}ms`);
        faces.clientWidth;
        faces.style.removeProperty('transform');
        faces.dataset.visibleFace = `${die.face}`;
    }
}
