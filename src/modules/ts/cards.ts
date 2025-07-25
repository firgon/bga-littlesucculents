type classForCard =
  | "BabyToes"
  | "SnakePlant"
  | "MexicanFirecracker"
  | "StringofPearls"
  | "StringofDolphins"
  | "JellybeanPlant"
  | "CalicoHearts"
  | "BunnyEars"
  | "RibbonPlant"
  | "BabySunRose"
  | "CoralCactus"
  | "LivingStone"
  | "RainbowWest"
  | "AloeVera"
  | "MoonCactus"
  | "LeafWindow"
  | "MermaidTail"
  | "PetRock"
  | "Pot"
  | "MoneyPlant"
  | "Water";

interface Card {
  deck: "setA" | "setB" | "starter";
  id: number;
  location:
    | "player"
    | "visibleDeck"
    | "plantboard"
    | "potboard"
    | "deckPlant"
    | "deckPot"
    | "waterCan"
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
  class?: classForCard;
  hint?: string;
  name?: string;
  flowered?: string;

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

    if (card.deck == "starter" && card.type == "pot") {
      element.classList.add("basicPot", card.state > 0 ? "right" : "left");
    }
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

  public updateAllToolTips() {
    this.game.forEachPlayer((player) => {
      debug("update du stock de ", player.id);
      this.game._stocks[player.id]
        .getCards()
        .forEach((card) => this.addTooltip(card as T));
    });
  }

  public getCardElementById(cardId: number): HTMLElement {
    return super.getCardElement({
      id: cardId,
      deck: "setA",
      location: "water",
      state: 0,
      extraDatas: undefined,
      playerId: 0,
      dataId: 0,
      tokenNb: 0,
    } as T);
  }

  public updateCardInformations(
    card: T,
    settings?: Omit<FlipCardSettings, "updateData">
  ): void {
    if (card.type === undefined) this.game.addStatics(card);
    super.updateCardInformations(card, settings);
    const newPlace = this.game._stocks[Generics.getCardContainer(card)];
    // debug("updateCardInformations", newPlace, card);
    if (newPlace && (!newPlace.contains(card) || newPlace instanceof SlotStock))
      newPlace.addCard(card);

    this.addTooltip(card);
  }

  addTooltip(card: T) {
    this.game.addCustomTooltip(
      CardSetting.getElementId(card) + "-front",
      this.tooltip_tpl(card)
    );
  }

  tooltip_tpl(card: T): string {
    const baseElem = this.getCardElement(card).cloneNode(true) as HTMLElement;
    baseElem.id = "";
    baseElem
      .querySelectorAll(".token, .help-marker")
      .forEach((elem) => elem.remove());
    return baseElem.outerHTML + this.createHelpText(card);
  }

  createHelpText<T extends Card>(card: T): string {
    const noExplanationPlants: classForCard[] = [
      "RainbowWest",
      "StringofPearls",
      "StringofDolphins",
      "CoralCactus",
      "BabySunRose",
      "LivingStone",
      "Pot",
    ];
    let html = '<div class="id-card">';

    //name
    html += `<div class="name">${_(card.name)}</div>`;

    //score details
    const scoreDetail =
      this.game.gamedatas.players[card.playerId]?.scoreDetails?.[card.id];
    // if (card.id == 10) debug("scoreDetail", scoreDetail);
    if (scoreDetail) {
      if (card.class == "MoneyPlant") {
        html += `<div class="total-money">${card.tokenNb}</div>`;
        html += "<p class='score-details'>";
        html += `<p class="explanations">${this.getExplanation(
          card,
          scoreDetail[3]
        )}</p>`;
        html += "</p>";
      } else {
        html += `<div class="total-score">${
          scoreDetail[0] + scoreDetail[1] + scoreDetail[2]
        }</div>`;

        html += "<p class='score-details'>";

        if (scoreDetail[0]) {
          html += `${_("Score for flower :")} ${scoreDetail[0]}<br>`;
        }
        if (card.type != POT) {
          html += `${_("Leaves on this succulent :")} ${scoreDetail[1]}<br>`;
        } else {
          html += _("Each pot scores 2 points");
        }

        if (!noExplanationPlants.includes(card.class)) {
          html += `${_("Special scoring :")} ${scoreDetail[2]}<br>`;

          //explanations
          if (card.class)
            html += `<p class="explanations">${this.getExplanation(
              card,
              scoreDetail[3]
            )}</p>`;
        }
        html += "</p>";
      }
    }
    //rule
    html += `<p class="fake-component"></p>`;
    html += `<p class="rules">${this.getRules(card.class)}</p>`;
    if (card.type == POT) {
      // for pot
      html += `<p>${this.game.fsr(_("Water to grow : ${value}"), {
        value: card.maxWater ?? "",
      })}</p>`;
      html += `<p>${this.game.fsr(_("Max succulent size : ${value} leaves"), {
        value: card.maxLeaf ?? "",
      })}</p>`;
    }
    html += `<p class="color">${this.game.fsr("Color : ${color}", {
      color: card.color ?? "",
      i18n: ["color"],
    })}</p>`;

    html += "</div>";
    return html;
  }

  getRules(classe: classForCard) {
    switch (classe) {
      case "BabyToes":
        return _(
          "If you have the same number of succulents on each side of your moneyplant, each copy of Baby Toes is worth 5 points."
        );
      case "SnakePlant":
        return _(
          "If this succulent has grown to it’s pots leaf capacity it’s considered ‘full’ and can’t grow anymore - it scores an additional 5 points. This applies to all pots."
        );
      case "MexicanFirecracker":
        return _(
          "If you have the most or equal most number of Mexican Firecracker plants, each is worth 5 points. Otherwise each is worth 2."
        );
      case "StringofPearls":
        return _(
          "This succulent can grow 6 more leaves than the maximum size of the pot. There are no additional bonus points."
        );
      case "StringofDolphins":
        return _(
          "Each time you convert water into leaves, add 2 leaves to the String of Dolphins."
        );
      case "JellybeanPlant":
        return _(
          "Count each of colour in your display (excluding gray and rainbow) and score 1 point for each per Jellybean plant you have. Consider both pot and plant cards."
        );
      case "CalicoHearts":
        return _(
          "Count the number of succulents between this Calico Hearts and the Money Plant. Score 1 points for each."
        );
      case "BunnyEars":
        return _(
          "If the number of leaves on this Bunny Ears is odd, score -1 point. If it is even, score +4 points."
        );
      case "RibbonPlant":
        return _(
          "Count the number of Ribbon Plants in all displays. The score for each is 1 times that number."
        );
      case "BabySunRose":
        return _(
          "Every turn, during the growth phase, move one leaf from another succulent onto this Baby Sun Rose. You may do this before or after placing water or leaves. If this Baby Sun Rose has reached it’s pot limit, do not move any leaves."
        );
      case "CoralCactus":
        return _(
          "This Coral Cactus gains an extra water droplet every grow phase."
        );
      case "LivingStone":
        return _("Score 3 points for each living stone you have");
      case "RainbowWest":
        return _(
          "The Rainbow West can flower any flower once per game. The colour of the pot needs to match the desired flower."
        );
      case "AloeVera":
        return _(
          "Each water in the watering can at the end of the game is worth 1 point (max 4)."
        );
      case "MoonCactus":
        return _(
          "At the end of the game, if you have no flowers in your display, score 7 points."
        );
      case "LeafWindow":
        return _(
          "If your Money Plant is at max capacity you score 7 points. The leaves on the Money Plant still score 0."
        );
      case "MermaidTail":
        return _(
          "If you have the most or equal most succulents, score 7 points."
        );
      case "PetRock":
        return _(
          "The pet rock never scores from it’s leaves - it scores 5 points at the end of the game."
        );
      case "MoneyPlant":
        return _(
          "Leaves on this Money Plant can be used at the market to buy new cards. The leaves of the Money Plant score 0 points."
        );
      case "Water":
        return "";
      case "Pot":
        return _("");
    }
  }

  getExplanation(card: Card, explanations: any) {
    let args = {};
    //prepare args
    for (let index = 0; index < explanations.length; index++) {
      args["item" + index] = explanations[index] ?? 0;
    }

    let log = "";
    switch (card.class) {
      case "BabyToes":
        log =
          "The display must be balanced, actually : ${item0} on left, ${item1} on right";
        break;
      case "SnakePlant":
        log = _("Snake Plant must be at max : ${item0}/${item1}");
        break;
      case "MermaidTail":
      case "MexicanFirecracker":
        log =
          (card.class == "MexicanFirecracker"
            ? _("Number of Mexican Firecracker :")
            : _("Number of Mermaid Tail :")) + "<br>";
        Object.entries(explanations).forEach(([key, value]) => {
          log += `${this.game._playerManager.getColoredName(
            +key
          )} : ${value}<br>`;
        });
        return log;
      case "JellybeanPlant":
        //TODO make it translatable
        const stringToTranslate =
          "(" +
          Object.keys(args)
            .map((e) => "${" + e + "}")
            .join(", ") +
          ")";
        args["i18n"] = Object.keys(args);
        return (
          this.game.fsr(_("Each color score 1 ${point}"), { point: "point" }) +
          this.game.fsr(stringToTranslate, args)
        );
      case "CalicoHearts":
        log = _("${item0} succulent(s) between this card and Money Plant");
        break;
      case "BunnyEars":
        log =
          card.tokenNb % 2 == 0
            ? _("${item0} token(s) on this card, it's even => 4 ${points}")
            : _("${item0} token(s) on this card, it's odd => -1 ${point}");
        break;
      case "RibbonPlant":
        log = _("${item0} Ribbon Plant(s) in all displays");
        break;
      case "AloeVera":
        log = this.game.isItMe(card.playerId)
          ? _("${you} have ${item0} droplet(s) in your water can")
          : _("${player_name} has ${item0} droplet(s) in his water can");
        break;
      case "MoonCactus":
        log = args["item0"] //true if you have more than 1 flower
          ? this.game.isItMe(card.playerId)
            ? _("${you} have ${item0} flowers(s) in your display, no bonus.")
            : _(
                "${player_name} has ${item0} flowers(s) in his display, no bonus."
              )
          : this.game.isItMe(card.playerId)
          ? _("${you} have ${item0} flower in your display => 7 ${points}")
          : _(
              "${player_name} has ${item0} flower in your display => 7 ${points}"
            );
        break;
      case "LeafWindow":
        log = _("Money plant must be at max : ${item0}/${item1}");
        break;
      case "MoneyPlant":
        log = this.game.isItMe(card.playerId)
          ? _("${you} have ${item0}$ to buy new pots or succulents.")
          : _("${player_name} has ${item0}$ to buy new pots or succulents.");
        break;
      case "Water":
        log = "";
        break;
    }

    args["player_name"] = this.game._playerManager.getColoredName(
      card.playerId
    );
    if (!this.game.isSpectator) {
      args["you"] = this.game.coloredYou();
    }
    args["points"] = _("points");
    args["point"] = _("point");
    if (args["i18n"]) {
      args["i18n"].push("point");
      args["i18n"].push("points");
    } else {
      args["i18n"] = ["points", "point"];
    }
    if (args && !log) debug("What can I do with ", args, card.class);
    return this.game.fsr(log, args);
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
