interface DieAnimation {
    /**
     * The stock to take the die. It will automatically remove the die from the other stock.
     */
    fromStock?: DiceStock;

    /**
     * The element to move the die from.
     */
    fromElement?: HTMLElement;

    /**
     * The side before animation.
     */
    originalSide?: 'front' | 'back';

    /**
     * If the die is rotated at the start of animation.
     */
    rotationDelta?: number;

    /**
     * An animation function, that return a Promise at the end of animation (the promise returns true if animation ended, false otherwise)
     */
    animation?: BgaAnimation<BgaElementAnimationSettings>;
}

interface DieAnimationSettings {

    /**
     * The side before animation.
     */
    originalSide?: 'front' | 'back';

    /**
     * If the die is rotated at the start of animation.
     */
    rotationDelta?: number;

    /**
     * An animation function, that return a Promise at the end of animation (the promise returns true if animation ended, false otherwise)
     */
    animation?: BgaAnimation<BgaElementAnimationSettings>;
}
