class Token {
  static countTokens(elem: HTMLElement) {
    return elem.querySelectorAll(".token").length;
  }

  static adjustTokens(card: Card, element: HTMLElement) {
    const [busyPlaces, availablePlaces] = Token.getAvailablePlaces(
      card,
      element
    );
    // if (card.tokenNb) debug("adjust_Token", card, busyPlaces, availablePlaces);
    if (busyPlaces.length < card.tokenNb) {
      Token.addTokens(
        card.tokenNb - busyPlaces.length,
        element,
        availablePlaces
      );
    } else {
      Token.removeTokens(Math.abs(card.tokenNb - busyPlaces.length), element);
    }
  }

  static addTokens(nb: number, elem: HTMLElement, availablePlaces: number[]) {
    for (let index = 0; index < nb; index++) {
      const token = Token.createToken(availablePlaces[index].toString());
      elem.append(token);
      token.classList.remove("trashed");
    }
  }

  static removeTokens(nb: number, elem: HTMLElement) {
    const tokens = elem.querySelectorAll(".token");
    for (let index = 0; index < nb; index++) {
      const element = tokens[index];
      element.classList.add("trashed");
      setTimeout(() => {
        element.remove();
      }, 500);
    }
  }

  static createToken(place: string): HTMLElement {
    const result = document.createElement("div");
    result.classList.add("token", "trashed");
    const sides = document.createElement("div");
    sides.classList.add("sides");
    ["front", "back"].forEach((side) => {
      const sideElem = document.createElement("div");
      sideElem.classList.add(side);
      sideElem.classList.add("side");
      sides.append(sideElem);
    });
    const rotate = Math.random() * 90 - 45;
    result.style.transform = `rotate(${rotate}deg)`;
    result.append(sides);
    result.dataset.placeId = place;
    return result;
  }

  static getAvailablePlaces(
    card: Card,
    element: HTMLElement
  ): [number[], number[]] {
    const places = Array.from(
      new Array((card.tokenNb ?? 0) + 2),
      (x, i) => i + 1
    );
    const busyPlaces = Array.from(element.querySelectorAll(".token")).map(
      (elem) => +(elem as HTMLElement).dataset.placeId
    );

    const getShuffledArr = (arr: number[]) => {
      const newArr = arr.slice();
      for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
      }
      return newArr;
    };

    return [
      busyPlaces,
      getShuffledArr(places.filter((x) => !busyPlaces.includes(x))),
    ];
  }
}
