interface BgaDie {
    type: number | string;
    id: number;
    face: number;
}

interface BgaDieType {
    facesCount: number;
    size?: number;

    /**
     * Allow to populate the main div of the die. You can set classes or dataset, if it's informations shared by all faces.
     * 
     * @param die the die informations
     * @param element the die main Div element
     */
    setupDieDiv: (die: BgaDie, element: HTMLDivElement) => void;

    /**
     * Allow to populate a face div of the die. You can set classes or dataset to show the correct die face.
     * 
     * @param die the die informations
     * @param element the die face Div element
     * @param face the face number (1-indexed)
     */
    setupFaceDiv?: (die: BgaDie, element: HTMLDivElement, face: number) => void;
}