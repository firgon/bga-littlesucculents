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
  setupBackDiv(card: T, element: HTMLDivElement) {
    if (card.location == "waterCan") {
      Generics.addTextDiv(_("Watering Can"), "title", element, true);
      Generics.addTextDiv(
        _("Tend Action:<br>+2 water in this can"),
        "text",
        element,
        true
      );
    }
  }
  setupDiv(card: T, element: HTMLDivElement) {
    element.classList.add(card.type);

    if (card.deck == "starter" && card.type == "pot") {
      element.classList.add("basicPot", card.state > 0 ? "right" : "left");
    }
    if (card.type != "pot") {
      ["token", "flower"].forEach((name) => {
        const tokenPlaceHolder = document.createElement("div");
        tokenPlaceHolder.id = name + "PlaceHolder-" + card.id;
        tokenPlaceHolder.classList.add(name + "PlaceHolder");
        if (name == "token")
          GretchensGardenGame.addAutomaticCounter(tokenPlaceHolder, ".token");
        element.appendChild(tokenPlaceHolder);
      });
    } else {
      element.dataset.maxWater = card.maxWater?.toString();
    }
  }
  setupFrontDiv(card: T, element: HTMLDivElement) {
    if (card.dataId) element.dataset.dataId = card.dataId.toString();
    if (card.type == "plant") {
      Generics.addTextDiv(
        this.animationManager.game.insertIcons(card.hint),
        "text",
        element,
        true
      );
      Generics.addTextDiv(_(card.name), "title", element, true);
    }

    Generics.addIdDiv(card, element);

    //generate Tokens
    this.animationManager.game._tokenManager.adjustTokens(card);
  }
  unselectableCardClass?: string;
}

class MyCardManager<T extends Card> extends CardManager<T> {
  public game: GretchensGardenGame;

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

  addStatics(card: Card) {
    const gretchensgarden_f = (data) => {
      return {
        type: data[0],
        maxLeaf: data[1],
        maxWater: data[2],
        nb: data[3],
        color: data[4],
        deck: data[5],
        class: data[6],
        name: data[7],
        subtitle: data[9],
        hint: data[8],
      };
    };
    // prettier-ignore
    const CARDS_DATA = {
    1: gretchensgarden_f([POT, 2, 1, 8, GREY, STARTER, 'Pot', _('Pot'), '', '']),
    2: gretchensgarden_f([POT, 6, 2, 1, PINK, DECK_POT, 'Pot', _('Pot'), '', '']),
    3: gretchensgarden_f([POT, 8, 3, 1, PINK, DECK_POT, 'Pot', _('Pot'), '', '']),
    4: gretchensgarden_f([POT, 12, 4, 1, PINK, DECK_POT, 'Pot', _('Pot'), '', '']),
    5: gretchensgarden_f([POT, 6, 2, 1, ORANGE, DECK_POT, 'Pot', _('Pot'), '', '']),
    6: gretchensgarden_f([POT, 8, 3, 1, ORANGE, DECK_POT, 'Pot', _('Pot'), '', '']),
    7: gretchensgarden_f([POT, 12, 4, 1, ORANGE, DECK_POT, 'Pot', _('Pot'), '', '']),
    8: gretchensgarden_f([POT, 6, 2, 1, YELLOW, DECK_POT, 'Pot', _('Pot'), '', '']),
    9: gretchensgarden_f([POT, 8, 3, 1, YELLOW, DECK_POT, 'Pot', _('Pot'), '', '']),
    10: gretchensgarden_f([POT, 12, 4, 1, YELLOW, DECK_POT, 'Pot', _('Pot'), '', '']),
    11: gretchensgarden_f([POT, 6, 2, 1, GREEN, DECK_POT, 'Pot', _('Pot'), '', '']),
    12: gretchensgarden_f([POT, 8, 3, 1, GREEN, DECK_POT, 'Pot', _('Pot'), '', '']),
    13: gretchensgarden_f([POT, 12, 4, 1, GREEN, DECK_POT, 'Pot', _('Pot'), '', '']),
    14: gretchensgarden_f([POT, 6, 2, 1, BLUE, DECK_POT, 'Pot', _('Pot'), '', '']),
    15: gretchensgarden_f([POT, 8, 3, 1, BLUE, DECK_POT, 'Pot', _('Pot'), '', '']),
    16: gretchensgarden_f([POT, 12, 4, 1, BLUE, DECK_POT, 'Pot', _('Pot'), '', '']),
    17: gretchensgarden_f([POT, 6, 2, 1, RED, DECK_POT, 'Pot', _('Pot'), '', '']),
    18: gretchensgarden_f([POT, 8, 3, 1, RED, DECK_POT, 'Pot', _('Pot'), '', '']),
    19: gretchensgarden_f([POT, 12, 4, 1, RED, DECK_POT, 'Pot', _('Pot'), '', '']),
    20: gretchensgarden_f([POT, 4, 1, 6, RAINBOW, DECK_POT, 'Pot', _('Pot'), '']),
    21: gretchensgarden_f([PLANT, 0, 0, 6, PINK, SET_A, 'BabyToes', _('Baby Toes'), _('<5vp><br>if same number of plants left and right of money plant'), _('every step is a balancing act')]),
    22: gretchensgarden_f([PLANT, 0, 0, 6, ORANGE, SET_A, 'SnakePlant', _('Snake Plant'), _('<5vp><br>if if holds as many leaves as the pot allows'), _('snakes plants are non-venomous')]),
    23: gretchensgarden_f([PLANT, 0, 0, 6, YELLOW, SET_A, 'MexicanFirecracker', _('Mexican Firecracker'), _('per Mexican Firecraker:<br><5vp> if most<br><2vp> otherwise'), _('goes out with a bang')]),
    24: gretchensgarden_f([PLANT, 0, 0, 6, GREEN, SET_A, 'StringofPearls', _('String of Pearls'), _('can hold 6 additional leaves'), _('makes the most of its space')]),
    25: gretchensgarden_f([PLANT, 0, 0, 6, BLUE, SET_A, 'StringofDolphins', _('String of Dolphins'), _('Growth Phase:<br>+2 leaves from the stock'), _('smarter than the average plant')]),
    26: gretchensgarden_f([PLANT, 0, 0, 6, RED, SET_A, 'JellybeanPlant', _('Jellybean Plant'), _('<Xvp><br>? = number of colors in your display'), _('the forbidden snack')]),
    27: gretchensgarden_f([PLANT, 0, 0, 6, PINK, SET_B, 'CalicoHearts', _('Calico Hearts'), _('<Xvp><br>? = distance from money plant'), _('money can\'t buy love')]),
    28: gretchensgarden_f([PLANT, 0, 0, 6, ORANGE, SET_B, 'BunnyEars', _('Bunny Ears'), _('number of leaves on it:<br><4vp> if even<br><-1vp> if odd'), _('best in pairs')]),
    29: gretchensgarden_f([PLANT, 0, 0, 6, YELLOW, SET_B, 'RibbonPlant', _('Ribbon Plant'), _('<Xvp><br>? = number of copies in all displays'), _('the more the merrier')]),
    30: gretchensgarden_f([PLANT, 0, 0, 6, GREEN, SET_B, 'BabySunRose', _('Baby Sun Rose'), _('Growth Phase:<br>+1 leaf from another plant in your display'), _('spreads in sun-drenched light')]),
    31: gretchensgarden_f([PLANT, 0, 0, 6, BLUE, SET_B, 'CoralCactus', _('Coral Cactus'), _('Weather Phase:<br>+1 water in this pot'), _('likes to stay a little moist')]),
    32: gretchensgarden_f([PLANT, 0, 0, 6, RED, SET_B, 'LivingStone', _('Living Stone'), '<3vp>', _('life is like a box of stones')]),
    33: gretchensgarden_f([PLANT, 0, 0, 1, RAINBOW, DECK_PLANT, 'RainbowWest', _('Rainbow West'), _('Flower Action:<br>matches its pot color'), _('can change color to suit the season')]),
    34: gretchensgarden_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'AloeVera', _('Aloe Vera'), _('<Xvp><br>? = amount of water in your can'), _('the healing plant')]),
    35: gretchensgarden_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MoonCactus', _('Moon Cactus'), _('<7vp><br>if there is no flower in your display'), _('the only flower that matters')]),
    36: gretchensgarden_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'LeafWindow', _('Leaf Window'), _('<7vp><br>if your money plant has 4 leaves'), _('little glass houses')]),
    37: gretchensgarden_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MermaidTail', _('Mermaid Tail'), _('<7vp><br>if you have the most plants'), _('needs a treasure trove')]),
    38: gretchensgarden_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, 'PetRock', _('Pet Rock'), _('<5vp><br>does not grow'), _('his name is Dwayne')]),
    39 : gretchensgarden_f([POT, 4, 2, 4, GREY, STARTER + POT, 'Pot', _('Pot'), '', '']),
    40 : gretchensgarden_f([PLANT, 0, 0, 4, GREY, STARTER + PLANT, 'MoneyPlant', _('Money Plant'), _('leaves here = <money>'), _('the green gold')]),
    41 : gretchensgarden_f([WATER, 0, 1, 3, GREY, WATER, 'Water', _('Water'), '', '']),
    42 : gretchensgarden_f([WATER, 0, 2, 3, GREY, WATER, 'Water', _('Water'), '', '']),
    43 : gretchensgarden_f([WATER, 0, 3, 3, GREY, WATER, 'Water', _('Water'), '', '']),
    44 : gretchensgarden_f([WATER, 0, 4, 3, GREY, WATER, 'Water', _('Water'), '', '']),
  }
    if (CARDS_DATA.hasOwnProperty(card.dataId))
      Object.assign(card, CARDS_DATA[card.dataId]);
    return card;
  }
}

class SlotStockForSucculents<T extends Card> extends SlotStock<T> {
  public game: GretchensGardenGame;

  constructor(
    protected manager: CardManager<T>,
    protected element: HTMLElement,
    settings: SlotStockSettings<T>
  ) {
    super(manager, element, settings);
    this.game = manager.game as GretchensGardenGame;
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
