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

  static addTextDiv(
    text: string,
    classe: string,
    element: HTMLElement,
    isAutofit: boolean = false
  ): void {
    let div = document.createElement("div");
    div.classList.add(classe);
    if (isAutofit) div.classList.add("bga-autofit");
    const innerDiv = document.createElement("div");
    innerDiv.innerHTML = text;
    div.append(innerDiv);
    if (element.querySelector("." + classe))
      element.replaceChild(div, element.querySelector("." + classe));
    else element.append(div);
  }

  static getCardContainer(card: Card) {
    switch (card.location) {
      case "player":
        return card.playerId;
      case "plantboard":
      case "potboard":
        return "board";
      case "waterCan":
        return "waterCan-" + card.playerId;

      default:
        return card.location;
    }
  }
}
