class Generics {
  static addIdDiv(card: { id: number }, element: HTMLElement): void {
    let div = document.createElement("div");
    div.classList.add("id_number");
    if (card.id) div.innerText = card.id.toString();

    if (element.querySelector(".id_number")) {
      element.replaceChild(div, element.querySelector(".id_number"));
    } else {
      element.append(div);
    }
  }

  static addTextDiv(text: string, classe: string, element: HTMLElement): void {
    let div = document.createElement("div");
    div.classList.add(classe);
    const innerDiv = document.createElement("div");
    innerDiv.innerHTML = text;
    div.append(innerDiv);
    if (element.querySelector("." + classe))
      element.replaceChild(div, element.querySelector("." + classe));
    else element.append(div);
  }

  static getCardContainer(card: Card) {
    return card.location == "player"
      ? card.playerId
      : card.location == "plantboard" || card.location == "potboard"
      ? "board"
      : card.location;
  }
}
