interface Card {
  id: number;
  location: "player" | "visibleDeck" | "board" | "deckPlant" | "deckPot";
  state: number;
  extraDatas: any;
  playerId: number;
  dataId: number;
  type: "pot" | "plant";
  color: string;
  maxWater: number;
  maxLeaf: number;
  tokens: number;
}

class CardSetting<T extends Card> implements CardManagerSettings<T> {
  public static getElementId(card: Card) {
    return card.type + "_" + card.id;
  }

  constructor(public animationManager) {}
  cardHeight = 88;
  cardWidth = 63;
  getId(card: T) {
    return CardSetting.getElementId(card);
  }
  selectableCardClass: "selectable";
  selectedCardClass: "selected";
  setupBackDiv?: (card: T, element: HTMLDivElement) => void;
  setupDiv(card: T, element: HTMLDivElement) {
    element.classList.add(card.type);
  }
  setupFrontDiv(card: T, element: HTMLDivElement) {
    if (card.dataId) element.dataset.dataId = card.dataId.toString();

    Generics.addIdDiv(card, element);
  }
  unselectableCardClass?: string;
}

class MyCardManager<T extends Card> extends CardManager<T> {
  public game: LittleSucculentsGame;

  public updateCardInformations(
    card: T,
    settings?: Omit<FlipCardSettings, "updateData">
  ): void {
    super.updateCardInformations(card, settings);
    const newPlace = this.game._stocks[Generics.getCardContainer(card)];
    if (!newPlace.contains(card)) newPlace.addCard(card);

    // this.game.addCustomTooltip(
    //   CardSetting.getElementId(card) + "-front",
    //   this.game.tooltip_tpl(card, "tooltip")
    // );
  }

  isElementFlipped(card: T) {
    return this.getCardElement(card).dataset.side == "back";
  }
}

// class DeckForSuperGame<T extends Card> extends Deck<T> {
//   public mine: boolean = false;
//   public getElement() {
//     return this.element;
//   }

//   /**
//    * Set the the cards number.
//    *
//    * @param cardNumber the cards number
//    * @param topCard the deck top card. If unset, will generated a fake card (default). Set it to null to not generate a new topCard.
//    */
//   public setCardNumber(
//     cardNumber: number,
//     topCard: T | null | undefined = undefined
//   ): Promise<boolean> {
//     let promise = Promise.resolve(false);
//     const oldTopCard = this.getTopCard();
//     if (false) {
//       const newTopCard = topCard || this.getFakeCard();
//       if (
//         !oldTopCard ||
//         this.manager.getId(newTopCard) != this.manager.getId(oldTopCard)
//       ) {
//         promise = this.addCard(newTopCard, undefined, <AddCardToDeckSettings>{
//           autoUpdateCardNumber: false,
//         });
//       }
//     } else if (cardNumber == 0 && oldTopCard) {
//       promise = this.removeCard(oldTopCard, <RemoveCardSettings>{
//         autoUpdateCardNumber: false,
//       });
//     }
//     this.cardNumber = cardNumber;

//     this.element.dataset.empty = (this.cardNumber == 0).toString();

//     let thickness = 0;
//     this.thicknesses.forEach((threshold, index) => {
//       if (this.cardNumber >= threshold) {
//         thickness = index;
//       }
//     });
//     this.element.style.setProperty("--thickness", `${thickness}px`);

//     const counterDiv = this.element.querySelector(".bga-cards_deck-counter");
//     if (counterDiv) {
//       counterDiv.innerHTML = `${cardNumber}`;
//     }

//     return promise;
//   }
// }

// class SuperAllVisibleDeck<T extends Card> extends AllVisibleDeck<T> {
//   public mine: boolean = false;
//   public getElement() {
//     return this.element;
//   }
// }
// class DeckSuper<T extends Card> extends DeckForSuperGame<T> {
//   public onSelectionChange = (selection: T[], lastChange: T) => {
//     debug(selection, lastChange);
//     const game = this.manager.game as SuperGameGame;
//     if (
//       game.isCurrentPlayerActive()
//       // && (this.manager.game as SuperGameGame).isState("play")
//     ) {
//       if (!selection.length) {
//         return game.restoreServerGameState();
//       }
//       if (lastChange.type == "mission") {
//         game.clientState(
//           "clientMission",
//           _("${You} must choose which Supers go on the mission"),
//           {
//             card: lastChange,
//             You: game.coloredYou(),
//           }
//         );
//       } else {
//         game.clientState(
//           "clientRecruit",
//           _("${You} must choose a slot for this Super"),
//           {
//             card: lastChange,
//             You: game.coloredYou(),
//           }
//         );
//       }
//     }
//   };
// }
let littlesucculents_f = (data) => {
  return {
    type: data[0],
    maxLeaf: data[1],
    maxWater: data[2],
    nb: data[3],
    color: data[4],
    deck: data[5],
    class: data[6],
    name: data[7],
  };
};

/*
 * Game Constants
 */
const POT = "pot";
const PLANT = "plant";

const YELLOW = "yellow";
const PURPLE = "purple";
const GREEN = "green";
const BLUE = "blue";
const GREY = "grey";
const RED = "red";
const PINK = "pink";
const ORANGE = "orange";
const DECK_PLANT = "deckplant";
const DECK_POT = "deckpot";
const RAINBOW = "rainbow";
const SET_A = "setA";
const SET_B = "setB";
const STARTER = "starter";

// prettier-ignore
const CARDS_DATA = {
    1: littlesucculents_f([POT, 2, 1, 8, GREY, STARTER, 'Pot', 'Pot']),
    2: littlesucculents_f([POT, 6, 2, 1, PINK, DECK_POT, 'Pot', 'Pot']),
    3: littlesucculents_f([POT, 8, 3, 1, PINK, DECK_POT, 'Pot', 'Pot']),
    4: littlesucculents_f([POT, 12, 4, 1, PINK, DECK_POT, 'Pot', 'Pot']),
    5: littlesucculents_f([POT, 6, 2, 1, ORANGE, DECK_POT, 'Pot', 'Pot']),
    6: littlesucculents_f([POT, 8, 3, 1, ORANGE, DECK_POT, 'Pot', 'Pot']),
    7: littlesucculents_f([POT, 12, 4, 1, ORANGE, DECK_POT, 'Pot', 'Pot']),
    8: littlesucculents_f([POT, 6, 2, 1, YELLOW, DECK_POT, 'Pot', 'Pot']),
    9: littlesucculents_f([POT, 8, 3, 1, YELLOW, DECK_POT, 'Pot', 'Pot']),
    10: littlesucculents_f([POT, 12, 4, 1, YELLOW, DECK_POT, 'Pot', 'Pot']),
    11: littlesucculents_f([POT, 6, 2, 1, GREEN, DECK_POT, 'Pot', 'Pot']),
    12: littlesucculents_f([POT, 8, 3, 1, GREEN, DECK_POT, 'Pot', 'Pot']),
    13: littlesucculents_f([POT, 12, 4, 1, GREEN, DECK_POT, 'Pot', 'Pot']),
    14: littlesucculents_f([POT, 6, 2, 1, BLUE, DECK_POT, 'Pot', 'Pot']),
    15: littlesucculents_f([POT, 8, 3, 1, BLUE, DECK_POT, 'Pot', 'Pot']),
    16: littlesucculents_f([POT, 12, 4, 1, BLUE, DECK_POT, 'Pot', 'Pot']),
    17: littlesucculents_f([POT, 6, 2, 1, RED, DECK_POT, 'Pot', 'Pot']),
    18: littlesucculents_f([POT, 8, 3, 1, RED, DECK_POT, 'Pot', 'Pot']),
    19: littlesucculents_f([POT, 12, 4, 1, RED, DECK_POT, 'Pot', 'Pot']),
    20: littlesucculents_f([POT, 4, 1, 6, RAINBOW, DECK_POT, 'Pot', 'Pot']),
    21: littlesucculents_f([PLANT, 0, 0, 6, PINK, SET_A, 'BabyToes', 'Baby Toes']),
    22: littlesucculents_f([PLANT, 0, 0, 6, ORANGE, SET_A, 'SnakePlant', 'Snake Plant']),
    23: littlesucculents_f([PLANT, 0, 0, 6, YELLOW, SET_A, 'MexicanFirecracker', 'Mexican Firecracker']),
    24: littlesucculents_f([PLANT, 0, 0, 6, GREEN, SET_A, 'StringofPearls', 'String of Pearls']),
    25: littlesucculents_f([PLANT, 0, 0, 6, BLUE, SET_A, 'StringofDolphins', 'String of Dolphins']),
    26: littlesucculents_f([PLANT, 0, 0, 6, RED, SET_A, 'JellybeanPlant', 'Jellybean Plant']),
    27: littlesucculents_f([PLANT, 0, 0, 6, PINK, SET_B, 'CalicoHearts', 'Calico Hearts']),
    28: littlesucculents_f([PLANT, 0, 0, 6, ORANGE, SET_B, 'BunnyEars', 'Bunny Ears']),
    29: littlesucculents_f([PLANT, 0, 0, 6, YELLOW, SET_B, 'RibbonPlant', 'Ribbon Plant']),
    30: littlesucculents_f([PLANT, 0, 0, 6, GREEN, SET_B, 'BabySunRose', 'Baby Sun Rose']),
    31: littlesucculents_f([PLANT, 0, 0, 6, BLUE, SET_B, 'CoralCactus', 'Coral Cactus']),
    32: littlesucculents_f([PLANT, 0, 0, 6, RED, SET_B, 'LivingStone', 'Living Stone']),
    33: littlesucculents_f([PLANT, 0, 0, 1, RAINBOW, DECK_PLANT, 'RainbowWest', 'Rainbow West']),
    34: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'AloeVera', 'Aloe Vera']),
    35: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MoonCactus', 'Moon Cactus']),
    36: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'LeafWindow', 'Leaf Window']),
    37: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MermaidTail', 'Mermaid Tail']),
    38: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'PetRock', 'Pet Rock']),
  }
