interface LineStockSettings extends DieStockSettings {
    /**
     * Indicate if the line should wrap when needed (default wrap)
     */
    wrap?: 'wrap' | 'nowrap';

    /**
     * Indicate the line direction (default row)
     */
    direction?: 'row' | 'column';

    /**
     * indicate if the line should be centered (default yes)
     */
    center?: boolean;
    
    /**
    * CSS to set the gap between dice. '8px' if unset.
    */
    gap?: string;
}

/**
 * A basic stock for a list of dice, based on flex.
 */
class LineDiceStock extends DiceStock {
    /**
     * @param manager the die manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    constructor(protected manager: DiceManager, protected element: HTMLElement, settings?: LineStockSettings) {
        super(manager, element, settings);
        element.classList.add('bga-dice_line-stock');

        element.dataset.center = (settings?.center ?? true).toString();
        element.style.setProperty('--wrap', settings?.wrap ?? 'wrap');
        element.style.setProperty('--direction', settings?.direction ?? 'row');
        element.style.setProperty('--gap', settings?.gap ?? '8px');
    }
}