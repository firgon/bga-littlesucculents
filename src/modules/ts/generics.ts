class Generics {
  static addIdDiv(card: { dataId: number }, element: HTMLElement): void {
    let div = document.createElement("div");
    div.classList.add("id_number");
    if (card.dataId) div.innerText = card.dataId.toString();
    element.append(div);
  }

  static getCardContainer(card: Card) {
    return card.location;
  }
}
