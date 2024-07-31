class TakenokolorDie extends BgaDie6 {
    constructor() {
        super();
    }

    setupDieDiv(die, element) {
        super.setupDieDiv(die, element);
        element.classList.add('takenokolor-die');
        element.style.setProperty('--color', die.color);

        const faces = element.firstElementChild;

        for (let face = 1; face <= 6; face++) {
            const penSide = document.createElement('div');
            penSide.classList.add('pen-face', 'pen-side');
            penSide.dataset.face = face;
            faces.appendChild(penSide);
        }
    }

    setupFaceDiv(die, element, face) {
        element.innerText = `face ${face}`;
    }
}