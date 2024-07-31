interface BgaDie4Settings {
    /**
     * 
     */
    showValueOverlay?: boolean;
}

const BGA_DIE4_FACE_NUMBERS = {
    1: [2, 4, 3],
    2: [1, 3, 4],
    3: [1, 4, 2],
    4: [1, 2, 3],
};

class BgaDie4 implements BgaDieType {
    public facesCount: number = 4;
    protected showValueOverlay: boolean;

    /**
     * Create the die type.
     * 
     * @param settings the die settings
     */
    constructor(protected settings?: BgaDie4Settings) {
        this.showValueOverlay = settings?.showValueOverlay ?? false;
    }

    /**
     * Allow to populate the main div of the die. You can set classes or dataset, if it's informations shared by all faces.
     * 
     * @param die the die informations
     * @param element the die main Div element
     */
    setupDieDiv(die: BgaDie, element: HTMLDivElement): void {
        element.classList.add('bga-dice_die4');
    }

    /**
     * Allow to populate a face div of the die. You can set classes or dataset to show the correct die face.
     * 
     * @param die the die informations
     * @param element the die face Div element
     * @param face the face number (1-indexed)
     */
    setupFaceDiv(die: BgaDie, element: HTMLDivElement, face: number): void {
        for (let i = 0; i < 3; i++) {
            const number = document.createElement('div');
            number.classList.add('bga-dice_die-face-number');
            number.dataset.number = `${BGA_DIE4_FACE_NUMBERS[face][i]}`;
            element.appendChild(number);
        }
    }
}