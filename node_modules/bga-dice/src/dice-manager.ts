interface DiceManagerSettings {
    /**
     * The animation manager used in the game. If not provided, a new one will be instanciated for this die manager. Useful if you use AnimationManager outside of dice manager, to avoid double instanciation.
     */
    animationManager?: AnimationManager;

    dieTypes?: {[dieType: number | string]: BgaDieType };

    /**
     * Perspective effect on Stock elements. Default 1000px. Can be overriden on each stock.
     */
    perspective?: number | null;

    /**
     * The class to apply to selectable dice. Default 'bga-dice_selectable-die'.
     */
    selectableDieClass?: string | null;

    /**
     * The class to apply to selectable dice. Default 'bga-dice_disabled-die'.
     */
    unselectableDieClass?: string | null;

    /**
     * The class to apply to selected dice. Default 'bga-dice_selected-die'.
     */
    selectedDieClass?: string | null;
}

class DiceManager {
    public animationManager: AnimationManager;

    private stocks: DiceStock[] = [];

    private registeredDieTypes: BgaDieType[] = [];

    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `DieManagerSettings` object
     */
    constructor(public game: Game, private settings: DiceManagerSettings) {
        this.animationManager = settings.animationManager ?? new AnimationManager(game);

        if (settings.dieTypes) {
            Object.entries(settings.dieTypes).forEach(entry => this.setDieType(entry[0], entry[1]));
        }
    }
    
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     * 
     * @returns if the animations are active.
     */
    public animationsActive(): boolean {
        return this.animationManager.animationsActive();
    }

    public addStock(stock: DiceStock) {
        this.stocks.push(stock);
    }
    
    public setDieType(type: number | string, dieType: BgaDieType) {
        this.registeredDieTypes[type] = dieType;
    }
    
    public getDieType(die: BgaDie): BgaDieType {
        return this.registeredDieTypes[die.type];
    }

    public getId(die: BgaDie): string {
        return `bga-die-${die.type}-${die.id}`;
    }

    public createDieElement(die: BgaDie): HTMLDivElement {
        const id = this.getId(die);

        if (this.getDieElement(die)) {
            throw new Error(`This die already exists ${JSON.stringify(die)}`);
        }

        const dieType: BgaDieType = this.registeredDieTypes[die.type];
        if (!dieType) {
            throw new Error(`This die type doesn't exists ${die.type}`);
        }

        const element = document.createElement("div");
        element.id = id;
        element.classList.add('bga-dice_die');
        element.style.setProperty('--size', `${dieType.size ?? 50}px`);
        
        const dieFaces = document.createElement("div");
        dieFaces.classList.add('bga-dice_die-faces');
        dieFaces.dataset.visibleFace = ''+die.face;
        element.appendChild(dieFaces);
        
        const facesElements = [];

        for (let i = 1; i <= dieType.facesCount; i++) {            
            facesElements[i] = document.createElement("div");
            facesElements[i].id = `${id}-face-${i}`;
            facesElements[i].classList.add('bga-dice_die-face');
            facesElements[i].dataset.face = ''+i;
            dieFaces.appendChild(facesElements[i]);
            element.dataset.face = ''+i;
        }
        

        document.body.appendChild(element);
        dieType.setupDieDiv?.(die, element);
        if (dieType.setupFaceDiv) {
            for (let i = 1; i <= dieType.facesCount; i++) {            
                dieType.setupFaceDiv?.(die, facesElements[i], i);
            }
        }
        document.body.removeChild(element);
        return element;
    }

    /**
     * @param die the die informations
     * @return the HTML element of an existing die
     */
    public getDieElement(die: BgaDie): HTMLElement {
        return document.getElementById(this.getId(die));
    }

    /**
     * Remove a die.
     * 
     * @param die the die to remove
     */
    public removeDie(die: BgaDie) {
        const id = this.getId(die);
        const div = document.getElementById(id);
        if (!div) {
            return false;
        }

        div.id = `deleted${id}`;
        div.remove();

        // if the die is in a stock, notify the stock about removal
        this.getDieStock(die)?.dieRemoved(die);

        return true;
    }

    /**
     * Returns the stock containing the die.
     * 
     * @param die the die informations
     * @return the stock containing the die
     */
    public getDieStock(die: BgaDie): DiceStock {
        return this.stocks.find(stock => stock.contains(die));
    }

    /**
     * Update the die informations. Used when a change visible face.
     * 
     * @param die the die informations
     */
    public updateDieInformations(die: BgaDie, updateData?: boolean): void {
        const div = this.getDieElement(die);
        div.dataset.visibleFace = ''+die.face;

        if (updateData ?? true) {
            // die data has changed
            const stock = this.getDieStock(die);
            const dice = stock.getDice();
            const dieIndex = dice.findIndex(c => this.getId(c) === this.getId(die));
            if (dieIndex !== -1) {
                (stock as any).dice.splice(dieIndex, 1, die);
            }
        }
    }

    /**
     * @returns the default perspective for all stocks.
     */
    public getPerspective(): number | null {
        return this.settings?.perspective === undefined ? 1000 : this.settings?.perspective;
    }

    /**
     * @returns the class to apply to selectable dice. Default 'bga-dice_selectable-die'.
     */
    public getSelectableDieClass(): string | null {
        return this.settings?.selectableDieClass === undefined ? 'bga-dice_selectable-die' : this.settings?.selectableDieClass;
    }

    /**
     * @returns the class to apply to selectable dice. Default 'bga-dice_disabled-die'.
     */
    public getUnselectableDieClass(): string | null {
        return this.settings?.unselectableDieClass === undefined ? 'bga-dice_disabled-die' : this.settings?.unselectableDieClass;
    }

    /**
     * @returns the class to apply to selected dice. Default 'bga-dice_selected-die'.
     */
    public getSelectedDieClass(): string | null {
        return this.settings?.selectedDieClass === undefined ? 'bga-dice_selected-die' : this.settings?.selectedDieClass;
    }
}