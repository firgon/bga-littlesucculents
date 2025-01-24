interface Card {
  id: number;
  location:
    | "player"
    | "visibleDeck"
    | "plantboard"
    | "potboard"
    | "deckPlant"
    | "deckPot"
    | "water"
    | "waterboard";
  state: number;
  extraDatas: any;
  playerId: number;
  dataId: number;
  tokenNb: number;

  type?: "pot" | "plant" | "water";
  color?: string;
  maxWater?: number;
  maxLeaf?: number;
  hint?: string;
  name?: string;
  flowered: boolean;

  tokenList?: [];
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
    if (card.type == "plant") {
      Generics.addTextDiv(
        this.animationManager.game.insertIcons(card.hint),
        "text",
        element
      );
      Generics.addTextDiv(_(card.name), "title", element);
    } else if (card.type == "pot") {
      Generics.addTextDiv(card.maxLeaf.toString(), "size", element);
    }

    Generics.addIdDiv(card, element);

    //generate Tokens
    this.animationManager.game._tokenManager.adjustTokens(card);
  }
  unselectableCardClass?: string;
}

class MyCardManager<T extends Card> extends CardManager<T> {
  public game: LittleSucculentsGame;

  public updateCardInformations(
    card: T,
    settings?: Omit<FlipCardSettings, "updateData">
  ): void {
    if (card.type === undefined) this.game.addStatics(card);
    super.updateCardInformations(card, settings);
    const newPlace = this.game._stocks[Generics.getCardContainer(card)];
    debug("updateCardInformations", newPlace, card);
    if (newPlace) newPlace.addCard(card);

    // this.game.addCustomTooltip(
    //   CardSetting.getElementId(card) + "-front",
    //   this.game.tooltip_tpl(card, "tooltip")
    // );
  }

  isElementFlipped(card: T) {
    return this.getCardElement(card).dataset.side == "back";
  }
}

class SlotStockForSucculents<T extends Card> extends SlotStock<T> {
  public game: LittleSucculentsGame;

  constructor(
    protected manager: CardManager<T>,
    protected element: HTMLElement,
    settings: SlotStockSettings<T>
  ) {
    super(manager, element, settings);
    this.game = manager.game as LittleSucculentsGame;
  }

  public addCard(
    card: T,
    animation?: CardAnimation<T>,
    settings?: AddCardToSlotSettings
  ): Promise<boolean> {
    this.game.addStatics(card);

    return super.addCard(card, animation, settings);
  }

  protected createSlot(slotId: SlotId) {
    this.slots[slotId] = document.createElement("div");
    this.slots[slotId].id = slotId;
    this.slots[slotId].dataset.slotId = slotId;
    this.element.appendChild(this.slots[slotId]);
    this.slots[slotId].classList.add(...["slot", ...this.slotClasses]);
  }
}

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
    hint: data[8],
  };
};

/*
 * Game Constants
 */
const POT = "pot";
const PLANT = "plant";
const WATER = "water";

const YELLOW = "yellow";
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
    1: littlesucculents_f([POT, 2, 1, 8, GREY, STARTER, 'Pot', 'Pot', '']),
    2: littlesucculents_f([POT, 6, 2, 1, PINK, DECK_POT, 'Pot', 'Pot', '']),
    3: littlesucculents_f([POT, 8, 3, 1, PINK, DECK_POT, 'Pot', 'Pot', '']),
    4: littlesucculents_f([POT, 12, 4, 1, PINK, DECK_POT, 'Pot', 'Pot', '']),
    5: littlesucculents_f([POT, 6, 2, 1, ORANGE, DECK_POT, 'Pot', 'Pot', '']),
    6: littlesucculents_f([POT, 8, 3, 1, ORANGE, DECK_POT, 'Pot', 'Pot', '']),
    7: littlesucculents_f([POT, 12, 4, 1, ORANGE, DECK_POT, 'Pot', 'Pot', '']),
    8: littlesucculents_f([POT, 6, 2, 1, YELLOW, DECK_POT, 'Pot', 'Pot', '']),
    9: littlesucculents_f([POT, 8, 3, 1, YELLOW, DECK_POT, 'Pot', 'Pot', '']),
    10: littlesucculents_f([POT, 12, 4, 1, YELLOW, DECK_POT, 'Pot', 'Pot', '']),
    11: littlesucculents_f([POT, 6, 2, 1, GREEN, DECK_POT, 'Pot', 'Pot', '']),
    12: littlesucculents_f([POT, 8, 3, 1, GREEN, DECK_POT, 'Pot', 'Pot', '']),
    13: littlesucculents_f([POT, 12, 4, 1, GREEN, DECK_POT, 'Pot', 'Pot', '']),
    14: littlesucculents_f([POT, 6, 2, 1, BLUE, DECK_POT, 'Pot', 'Pot', '']),
    15: littlesucculents_f([POT, 8, 3, 1, BLUE, DECK_POT, 'Pot', 'Pot', '']),
    16: littlesucculents_f([POT, 12, 4, 1, BLUE, DECK_POT, 'Pot', 'Pot', '']),
    17: littlesucculents_f([POT, 6, 2, 1, RED, DECK_POT, 'Pot', 'Pot', '']),
    18: littlesucculents_f([POT, 8, 3, 1, RED, DECK_POT, 'Pot', 'Pot', '']),
    19: littlesucculents_f([POT, 12, 4, 1, RED, DECK_POT, 'Pot', 'Pot', '']),
    20: littlesucculents_f([POT, 4, 1, 6, RAINBOW, DECK_POT, 'Pot', 'Pot']),
    21: littlesucculents_f([PLANT, 0, 0, 6, PINK, SET_A, 'BabyToes', 'Baby Toes', 'Balanced display<br>5 <vp>']),
    22: littlesucculents_f([PLANT, 0, 0, 6, ORANGE, SET_A, 'SnakePlant', 'Snake Plant', 'Plant is max <leaf><br>5 <vp>']),
    23: littlesucculents_f([PLANT, 0, 0, 6, YELLOW, SET_A, 'MexicanFirecracker', 'Mexican Firecracker', 'Most 5 <vp><br>Second 2 <vp>']),
    24: littlesucculents_f([PLANT, 0, 0, 6, GREEN, SET_A, 'StringofPearls', 'String of Pearls', 'Pot size<br>+6']),
    25: littlesucculents_f([PLANT, 0, 0, 6, BLUE, SET_A, 'StringofDolphins', 'String of Dolphins', 'Growth<br>+2']),
    26: littlesucculents_f([PLANT, 0, 0, 6, RED, SET_A, 'JellybeanPlant', 'Jellybean Plant', '1 <vp> per colour<br>in display']),
    27: littlesucculents_f([PLANT, 0, 0, 6, PINK, SET_B, 'CalicoHearts', 'Calico Hearts', '1 <vp> per space<br>from money plant']),
    28: littlesucculents_f([PLANT, 0, 0, 6, ORANGE, SET_B, 'BunnyEars', 'Bunny Ears', 'Total <leaf><br>Odd -1 <vp>/ Even 4 <vp>']),
    29: littlesucculents_f([PLANT, 0, 0, 6, YELLOW, SET_B, 'RibbonPlant', 'Ribbon Plant', '1 <vp> per copy<br>in all displays']),
    30: littlesucculents_f([PLANT, 0, 0, 6, GREEN, SET_B, 'BabySunRose', 'Baby Sun Rose', 'Take 1 <leaf> from display<br>in grow phase']),
    31: littlesucculents_f([PLANT, 0, 0, 6, BLUE, SET_B, 'CoralCactus', 'Coral Cactus', '+1 <water><br> in grow phase']),
    32: littlesucculents_f([PLANT, 0, 0, 6, RED, SET_B, 'LivingStone', 'Living Stone', '3 <vp>']),
    33: littlesucculents_f([PLANT, 0, 0, 1, RAINBOW, DECK_PLANT, 'RainbowWest', 'Rainbow West', 'Can flower<br>the colour of its pot']),
    34: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'AloeVera', 'Aloe Vera', 'each <water> in wathering can<br> is worth 1 <vp>']),
    35: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MoonCactus', 'Moon Cactus', 'If no flowers in display<br>7 <vp>']),
    36: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'LeafWindow', 'Leaf Window', 'If money plant is max <leaf><br>7 <vp>']),
    37: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MermaidTail', 'Mermaid Tail', 'Display has most plants<br>7 <vp>']),
    38: littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'PetRock', 'Pet Rock', '<leaf> don\'t score<br>5 <vp>']),
    39 : littlesucculents_f([POT, 4, 2, 4, GREY, STARTER + POT, 'Pot', 'Pot', '']),
    40 : littlesucculents_f([PLANT, 0, 0, 4, GREY, STARTER + PLANT, 'MoneyPlant', 'Money Plant', '<leaf> are <money><br>but worth 0<vp>']),
    41 : littlesucculents_f([WATER, 0, 1, 3, GREY, WATER, 'Water', 'Water', '']),
    42 : littlesucculents_f([WATER, 0, 2, 3, GREY, WATER, 'Water', 'Water', '']),
    43 : littlesucculents_f([WATER, 0, 3, 3, GREY, WATER, 'Water', 'Water', '']),
    44 : littlesucculents_f([WATER, 0, 4, 3, GREY, WATER, 'Water', 'Water', '']),
  }
