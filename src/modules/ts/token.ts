class Token {
  static idGen = 0;

  constructor(public gameui: GretchensGardenGame) {}

  static countTokens(elem: HTMLElement) {
    return elem.querySelectorAll(".token:not(.flower)").length;
  }

  static takeToken(elem: HTMLElement) {
    return elem.querySelector(".token:not(.flower)") as HTMLElement;
  }

  static takeAllTokens(elem: HTMLElement) {
    const list = elem.querySelectorAll(".token:not(.flower)");
    const array = [];
    for (const sub of list as any) {
      // then will pass compiler
      array.push(sub as HTMLElement);
    }
    return array;
  }

  moveTokenOnCard(token: HTMLElement, card: Card) {
    if (!token) {
      debug("Problem in moveTokenOnCard", token, card);
      return;
    }
    //add statics if needed
    if (card.type === undefined) this.gameui.addStatics(card);

    const cardElement = this.gameui._cardManager.getCardElement(card);

    const [busyPlaces, availablePlaces] = this.getAvailablePlaces(
      card,
      cardElement
    );

    //change token place if busy
    if (busyPlaces.includes(+token.dataset.placeId)) {
      debug("I change token placeId");
      token.dataset.placeId = availablePlaces[0].toString();
    }

    this.gameui.attachElementWithSlide(token, cardElement);
  }

  adjustTokens(card: Card, from: HTMLElement = null) {
    // debug("adjust Token", card);

    const element = this.gameui._cardManager.getCardElement(card);
    if (!element) return; //for fake case no need

    //flower
    if (card.flowered) {
      const flowerElem = this.gameui.getFlowerElem(card.flowered);
      // debug("bug", flowerElem, element);
      //wait added to make it running, don't know why
      this.gameui
        .wait(2)
        .then(() => this.gameui.attachElementWithSlide(flowerElem, element));
    }

    const [busyPlaces, availablePlaces] = this.getAvailablePlaces(
      card,
      element
    );
    const tokensOnCard = Math.max(0, card.tokenNb ?? 0);

    if (busyPlaces.length < tokensOnCard) {
      // debug(
      //   `There are ${
      //     busyPlaces.length
      //   } tokens on this element, it should have ${tokensOnCard}, i add ${
      //     card.tokenNb - busyPlaces.length
      //   } elems`
      // );
      this.addTokens(
        card.tokenNb - busyPlaces.length,
        card,
        availablePlaces,
        from
      );
    } else if (busyPlaces.length > tokensOnCard) {
      // debug(
      //   `There are ${
      //     busyPlaces.length
      //   } tokens on this element, it should have ${tokensOnCard}, i remove ${
      //     busyPlaces.length - card.tokenNb
      //   } elems`
      // );
      this.removeTokens(Math.abs(tokensOnCard - busyPlaces.length), element);
    }
  }

  addTokens(
    nb: number,
    card: Card,
    availablePlaces: number[],
    container: HTMLElement
  ) {
    // debug("addTokens", nb, card, availablePlaces);
    for (let index = 0; index < nb; index++) {
      if (container) {
        const token = this.createToken(container, availablePlaces[index]);
        this.moveTokenOnCard(token, card);
      } else {
        const token = this.createToken(
          this.gameui._cardManager.getCardElement(card),
          availablePlaces[index]
        );
        token.dataset.placeId = availablePlaces[index].toString();
      }
    }
  }

  removeTokens(nb: number, elem: HTMLElement) {
    debug("removeTOkens", nb, elem);
    const tokens = elem.querySelectorAll(".token");
    // debug("j'ai trouvé ces tokens :", tokens);
    for (let index = 0; index < nb; index++) {
      const element = tokens[index];
      gameui.slideToObjectAndDestroy(element, "pagemaintitletext");
    }
  }

  createToken(initialContainer: HTMLElement, placeId: number): HTMLElement {
    const result = document.createElement("div");
    result.id = "token-" + Token.idGen++;
    result.classList.add("token");
    const sides = document.createElement("div");
    sides.classList.add("sides");

    const rotate = Math.random() * 60 - 30;
    // sides.style.transform = `rotate(${rotate}deg)`;

    ["front", "back"].forEach((side) => {
      const sideElem = document.createElement("div");
      sideElem.classList.add(side);
      sideElem.classList.add("side");
      sides.append(sideElem);
    });
    result.append(sides);
    result.dataset.placeId = placeId.toString();
    initialContainer.append(result);
    return result;
  }

  getAvailablePlaces(
    card: Card,
    cardElement: HTMLElement
  ): [number[], number[]] {
    if (card.tokenNb < 0) {
      debug("ERROR with tokenNb", card);
      return;
    }
    const places = Array.from(
      new Array((card.tokenNb ?? 0) + 4),
      (x, i) => i + 1
    );
    const busyPlaces = Array.from(
      cardElement.querySelectorAll(".token:not(.flower)")
    ).map((elem) => +(elem as HTMLElement).dataset.placeId);

    const getShuffledArr = (arr: number[]) => {
      const newArr = arr.slice();
      for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
      }
      return newArr;
    };

    // debug("busyPlaces", cardElement, busyPlaces);
    return [
      busyPlaces,
      getShuffledArr(places.filter((x) => !busyPlaces.includes(x))),
    ];
  }
}
