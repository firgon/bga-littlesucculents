/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * littlesucculents implementation : © Emmanuel Albisser <emmanuel.albisser@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * littlesucculents.js
 *
 * littlesucculents user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

// @ts-ignore
GameGui = (function () {
  // this hack required so we fake extend GameGui
  function GameGui() {}
  return GameGui;
})();

var isDebug =
  window.location.host == "studio.boardgamearena.com" ||
  window.location.hash.indexOf("debug") > -1;
var debug = isDebug ? console.info.bind(window.console) : function () {};

class LittleSucculentsGame extends GameGui {
  public _stocks: { [stockId: string]: CardStock<Card> };
  public _cardManager: MyCardManager<Card>;
  public _tokenManager: Token;
  public possiblePlaces: { [cardId: number]: number };
  public _playerManager: Players;

  constructor() {
    super();
    this._nonActiveStates = ["water"];
    this._notifications = [
      ["updatePlayers", 0],
      ["moveCard", 500],
      ["refreshUi", 0],
      ["clearTurn", 0],
      ["playerReady", 0],
      ["pay", 200],
      ["updateCard", 500],
      ["updateDeck", 0],
      ["transfert", 500],
      ["drawCard", 500],
      ["startAction", 0],
      ["newScore", 0],
      // ['completeOtherHand', 1000, (notif) => notif.args.player_id == this.player_id],
    ];

    // Fix mobile viewport (remove CSS zoom)
    this.default_viewport = "width=800";

    this._counters = {};
    this._stocks = {};

    this._animationManager = new AnimationManager(this);
    const cardGameSetting: CardSetting<Card> = new CardSetting(
      this._animationManager
    );

    this._cardManager = new MyCardManager(this, cardGameSetting);
  }

  /*
█████████  ██████████ ███████████ █████  █████ ███████████ 
███░░░░░███░░███░░░░░█░█░░░███░░░█░░███  ░░███ ░░███░░░░░███
░███    ░░░  ░███  █ ░ ░   ░███  ░  ░███   ░███  ░███    ░███
░░█████████  ░██████       ░███     ░███   ░███  ░██████████ 
░░░░░░░░███ ░███░░█       ░███     ░███   ░███  ░███░░░░░░  
███    ░███ ░███ ░   █    ░███     ░███   ░███  ░███        
░░█████████  ██████████    █████    ░░████████   █████       
░░░░░░░░░  ░░░░░░░░░░    ░░░░░      ░░░░░░░░   ░░░░░        
														   
														   
														   
	  */

  public setup(gamedatas: GameDatas) {
    debug("setup", gamedatas);
    this.gamedatas = gamedatas;

    this._tokenManager = new Token(this);
    this._playerManager = new Players(this);

    // Setting up player boards
    this._playerManager.setupPlayers(gamedatas);

    this.setupCards(gamedatas);

    $("ebd-body").classList.toggle(
      "two-players",
      Object.keys(gamedatas.players).length == 2
    );

    //create zoom panel and define Utils
    this.setupZoomUI();

    //add general tooltips
    this.addTooltips();

    // add shortcut and navigation

    //add cheat block if cheatModule is active
    if (gamedatas.cheatModule) {
      this.cheatModuleSetup(gamedatas);
    }

    this.adaptWidth();
    this.inherited(arguments);

    // Create a new div for tokens before buttons in maintitlebar
    dojo.place("<div id='droplets'></div>", $("generalactions"), "before");

    this._turnCounter = new TurnCounter(gamedatas.turn, _("Season: "), "/12");
    if (gamedatas.turn == 12) this.displayCaution();

    if (isDebug) {
      $("ebd-body").classList.add("debug");
    }
    debug("Ending game setup");
  }

  /**
  █████████  ███████████   █████████   ███████████ ██████████  █████████ 
  ███░░░░░███░█░░░███░░░█  ███░░░░░███ ░█░░░███░░░█░░███░░░░░█ ███░░░░░███
  ░███    ░░░ ░   ░███  ░  ░███    ░███ ░   ░███  ░  ░███  █ ░ ░███    ░░░ 
  ░░█████████     ░███     ░███████████     ░███     ░██████   ░░█████████ 
  ░░░░░░░░███    ░███     ░███░░░░░███     ░███     ░███░░█    ░░░░░░░░███
  ███    ░███    ░███     ░███    ░███     ░███     ░███ ░   █ ███    ░███
  ░░█████████     █████    █████   █████    █████    ██████████░░█████████ 
  ░░░░░░░░░     ░░░░░    ░░░░░   ░░░░░    ░░░░░    ░░░░░░░░░░  ░░░░░░░░░  
														    
  */

  onEnteringStateConfirm(args) {
    this.addUndoButton();
    this.addDangerActionButton("btn-confirm", _("Confirm"), () => {
      this.takeAction({ actionName: "actConfirm" });
    });
    this.startActionTimer("btn-confirm", 8, this.getGameUserPreference(201));
  }

  onEnteringStateMove(args: {
    plants: Card[];
    possibleEmptyPlaces: number[];
    moves?: { [cardId: number]: number };
  }) {
    this._stocks[this.player_id].setSelectionMode("single");
    this._stocks[this.player_id].setSelectableCards(
      args.plants
        //exclude already moved cards
        .filter(
          (c) =>
            !args.moves || !Object.keys(args.moves).includes(c.id.toString())
        )
        .map((c) => this.addStatics(c))
    );
    this._stocks[this.player_id].onSelectionChange = (
      selection,
      lastChange
    ) => {
      if (selection.includes(lastChange)) {
        this.clientState(
          "clientChooseDestination",
          _("Choose where to move this plant"),
          {
            stateArgs: args,
            cardId: lastChange.id,
          }
        );
      }
    };
    this.addActionButton("btn-pass", _("I don't need"), () => {
      this.takeAction({
        actionName: "actPass",
      });
    });
    this.addUndoButton();
  }

  onEnteringStatePlay(args: {
    buyableCards: { [cardId: number]: Card };
    cuttableCards: { [cardId: number]: Card };
    flowerableCards: {
      possibleColors: { [cardId: number]: string[] };
      possiblePlants: { [cardId: number]: Card[] };
    };
    possiblePlaces: { plant: number[]; pot: number[] };
  }) {
    //buy action
    if (Object.values(args.buyableCards).length > 0) {
      this.addActionButton("btn-buy", _("Buy a card"), () => {
        this.clientState(
          "clientBuy",
          _("${you} can choose a card from market"),
          {
            buyableCards: args.buyableCards,
            possiblePlaces: args.possiblePlaces,
          }
        );
      });
    }
    //cut action
    if (Object.values(args.cuttableCards).length > 0) {
      this.addActionButton("btn-cut", _("Cut a plant"), () => {
        this.clientState(
          "clientCut",
          _("${you} can choose a plant to cut from an opponent display"),
          {
            cuttableCards: args.cuttableCards,
            possiblePlantPlaces: args.possiblePlaces[PLANT],
          }
        );
      });
    }
    //flower action
    if (Object.values(args.flowerableCards.possibleColors).length > 0) {
      this.addActionButton("btn-flower", _("Flower a plant"), () => {
        this.clientState(
          "clientFlower",
          _("${you} can choose a plant to flower"),
          args.flowerableCards
        );
      });
    }
    //tend action
    this.addActionButton("btn-tend", _("Tend"), () => {
      this.takeAction({ actionName: "actChooseTend" });
    });
  }

  onEnteringStateTend(args: { possibleTendActions: string[] }) {
    const translatableStrings = {
      move: _("Move"),
      water: _("Water"),
    };
    args.possibleTendActions.forEach((action) => {
      this.addActionButton("btn-" + action, translatableStrings[action], () =>
        this.takeAction({
          actionName: "actChooseAction",
          action: action,
        })
      );
    });
    this.addUndoButton();
  }

  onUpdateActivityWater(args) {
    debug("update water", args);
    this.addResetButton();
  }

  onLeavingStateWater(args) {
    debug("leaving water", args);
    if (!this.isSpectator) $("watercan-" + this.player_id).replaceChildren();
  }

  onLeavingStateWaterSolo(args) {
    this.onLeavingStateWater(args);
  }

  onEnteringStateWaterSolo(args) {
    this.onEnteringStateWater(args);
    this.addUndoButton();
  }

  onEnteringStateWater(args: {
    water: { [playerId: number]: number };
    possiblePlaces: {
      [playerId: number]: { [cardId: number]: number };
    };
    playerPlans: {
      [playerId: number]: number[];
    };
  }) {
    if (this.isSpectator) return;

    this.possiblePlaces = args.possiblePlaces[this.player_id];
    let remainingSpace = 0;

    //add possible click on all possiblePlaces
    Object.entries(args.possiblePlaces[this.player_id]).forEach(
      ([cardId, spaceNb]) => {
        if (+spaceNb > 0) {
          this.onClick("pot_" + cardId + "-front", () => {
            this.planMoveToken(+cardId);
          });
          remainingSpace += spaceNb as number;
        } else {
          $("pot_" + cardId + "-front").classList.add("unselectable");
        }
      }
    );

    const remainingDroplets = Math.min(
      args.water[this.player_id],
      remainingSpace
    );

    //prepare tokens
    for (let index = 0; index < args.water[this.player_id]; index++) {
      const element = this._tokenManager.createToken($("waterboard"), 0);
      this.attachElementWithSlide(element, $("droplets"));

      this.onClick(element.id, () => {
        if (!this.isCurrentPlayerActive()) return;
        const wasSelected = element.classList.contains("selected");
        document
          .querySelectorAll(".token.selected")
          .forEach((elem) => elem.classList.remove("selected"));
        if (!wasSelected) {
          element.classList.add("selected");
          this.displayTitle(
            this.fsr(_("${you} can choose a pot for this water"), {
              you: this.coloredYou(),
            })
          );
        } else {
          this.resetTitle();
        }
      });
    }

    //prepare buttons
    const takeAction = () => {
      this.takeAction({
        actionName: this.stateName == "water" ? "actWater" : "actWaterSolo",
        cardIds: Object.values(JSON.parse($("btn-water").dataset.moves)),
      });

      $("btn-reset").innerText = _("Change mind");
      this.replaceUnusedDropletIntoCan();
    };
    this.addPrimaryActionButton("btn-water", _("Confirm"), () => {
      if (+$("btn-water").dataset.remainingDroplets > 0) {
        this.confirmationDialog(
          "You can place more water droplets, all unused droplets will be placed in your watering can",
          takeAction
        );
      } else {
        takeAction();
      }
    });
    $("btn-water").dataset.remainingDroplets = remainingDroplets.toString();

    $("btn-water").dataset.moves = JSON.stringify({});

    $("btn-water").style.display = this.isCurrentPlayerActive()
      ? "inline-block"
      : "none";

    this.addResetButton();

    if (args.playerPlans[this.player_id]) {
      for (let index = 0; index < args.water[this.player_id]; index++) {
        // use playerPlans to premove token
        if (args.playerPlans[this.player_id][index]) {
          debug("plan done");
          this.planMoveToken(args.playerPlans[this.player_id][index]);
        }
      }
      this.replaceUnusedDropletIntoCan();
    }
  }

  onEnteringStateClientBuy(args: {
    buyableCards: { [cardId: number]: Card };
    possiblePlaces: { plant: number[]; pot: number[] };
  }) {
    this._stocks["board"].setSelectionMode("single");
    this._stocks["board"].setSelectableCards(
      Object.values(args.buyableCards).map((c) => this.addStatics(c))
    );
    this._stocks["board"].onSelectionChange = (selection, lastChange) => {
      this.clearSelectable();
      if (selection.includes(lastChange)) {
        args.possiblePlaces[lastChange.type].forEach((slotId) => {
          this.onClick(lastChange.type + slotId, () => {
            this.takeAction({
              actionName: "actBuy",
              cardId: lastChange.id,
              state: slotId,
            });
          });
        });
      }
    };
    this.addResetClientStateButton();
  }

  onEnteringStateClientChooseDestination(args: {
    stateArgs: {
      plants: Card[];
      possibleEmptyPlaces: number[];
      possiblePlaces: number[];
      moves?: { [cardId: number]: number };
    };
    cardId: number;
  }) {
    this.addResetClientStateButton();

    //select active CardId
    $("plant_" + args.cardId).classList.add("selected");
    this.onClick("plant_" + args.cardId, () => {
      this.clearClientState();
    });

    //empty spaces
    args.stateArgs.possibleEmptyPlaces.forEach((emptySpace) => {
      //if empty space is already a destination, forget it
      if (
        args.stateArgs.moves &&
        Object.values(args.stateArgs.moves).includes(emptySpace)
      ) {
        return;
      } else {
        this.onClick("plant" + emptySpace, () => {
          if (!args.stateArgs.moves) {
            args.stateArgs.moves = {};
          }
          args.stateArgs.moves[args.cardId] = emptySpace;

          this.takeAction({
            actionName: "actMovePlants",
            moves: args.stateArgs.moves,
          });
        });
      }
    });

    //space with cards (only for first move)
    if (!args.stateArgs.moves) {
      args.stateArgs.plants.forEach((plant) => {
        //do not move on itself
        if (plant.id == args.cardId) return;

        this.onClick("plant_" + plant.id, () => {
          args.stateArgs.moves = {};
          args.stateArgs.moves[args.cardId] = plant.state;

          const options = [_("Swap"), _("Move")];
          this.multipleChoiceDialog(
            _(
              "Would you like to swap both cards or just move the first one here ?"
            ),
            options,
            (choice) => {
              switch (+choice) {
                case 0:
                  debug(choice);
                  //swap both cards
                  args.stateArgs.moves[plant.id] = args.stateArgs.plants.find(
                    (c) => c.id == args.cardId
                  ).state;
                  this.takeAction({
                    actionName: "actMovePlants",
                    moves: args.stateArgs.moves,
                  });
                  return;
                case 1:
                  //move
                  this.clientState(
                    "clientChooseDestination",
                    _("Choose where to move this plant"),
                    {
                      stateArgs: args,
                      cardId: plant.id,
                    }
                  );
                  return;
              }
              return;
            }
          );
        });
      });
    }
  }

  onEnteringStateClientCut(args: {
    cuttableCards: { [cardId: number]: Card };
    possiblePlantPlaces: number[];
  }) {
    this.forEachPlayer((player) => {
      this._stocks[player.id].setSelectionMode("single");
      this._stocks[player.id].setSelectableCards(
        Object.values(args.cuttableCards).map((c) => this.addStatics(c))
      );
      this._stocks[player.id].onSelectionChange = (selection, lastChange) => {
        this.clearSelectable();
        if (selection.includes(lastChange)) {
          args.possiblePlantPlaces.forEach((slotId) => {
            this.onClick(lastChange.type + slotId, () => {
              this.takeAction({
                actionName: "actCut",
                cardId: lastChange.id,
                state: slotId,
              });
            });
          });
          this.displayTitle(
            _("${you} must choose where to place your new succulent")
          );
        } else {
          this.displayTitle(this.currentStateTitle);
        }
      };
    });

    this.addResetClientStateButton();
  }

  onEnteringStateClientFlower(args: {
    possibleColors: { [cardId: number]: string[] };
    possiblePlants: { [cardId: number]: Card };
  }) {
    this._stocks[this.player_id].setSelectionMode("single");
    this._stocks[this.player_id].setSelectableCards(
      Object.values(args.possiblePlants).map((c) => this.addStatics(c))
    );
    this._stocks[this.player_id].onSelectionChange = (
      selection,
      lastChange
    ) => {
      this.clearSelectable();
      if (selection.includes(lastChange)) {
        const possibleColors = args.possibleColors[lastChange.id];
        if (possibleColors.length == 1) {
          this.takeAction({
            actionName: "actFlower",
            plantId: lastChange.id,
            color: possibleColors[0],
          });
        } else {
          possibleColors.forEach((color) => {
            const flower = this.getFlowerElem(color);
            if (!flower) {
              debug("Houston we have a pb with choosing a flower " + color);
            } else {
              this.onClick($(flower), () => {
                this.takeAction({
                  actionName: "actFlower",
                  plantId: lastChange.id,
                  color: color,
                });
              });
            }
          });
        }

        this.displayTitle(_("${you} must choose one flower color"));
      } else {
        this.displayTitle(this.currentStateTitle);
      }
    };
  }

  //
  //
  // █████████████    ██████  █████ █████  ██████   █████
  //░░███░░███░░███  ███░░███░░███ ░░███  ███░░███ ███░░
  // ░███ ░███ ░███ ░███ ░███ ░███  ░███ ░███████ ░░█████
  // ░███ ░███ ░███ ░███ ░███ ░░███ ███  ░███░░░   ░░░░███
  // █████░███ █████░░██████   ░░█████   ░░██████  ██████
  //░░░░░ ░░░ ░░░░░  ░░░░░░     ░░░░░     ░░░░░░  ░░░░░░
  //
  //
  //

  // moveElement(element: HTMLElement, toElement: HTMLElement) {
  //   // move an element to a destination. It's only visual, the element is still linked to its parent.
  //   this._animationManager.play(
  //     new BgaSlideAnimation({ element, toElement: toElement })
  //   );
  // }

  attachElementWithSlide(element: HTMLElement, toElement: HTMLElement) {
    debug("attachElementWithSlide", element, toElement);
    // move an element to a destination element and attach it.
    this._animationManager.attachWithAnimation(
      new BgaSlideAnimation({ element }),
      toElement
    );
  }

  //   █████████               ███                             █████     ███
  //  ███░░░░░███             ░░░                             ░░███     ░░░
  // ░███    ░███  ████████   ████  █████████████    ██████   ███████   ████   ██████  ████████    █████
  // ░███████████ ░░███░░███ ░░███ ░░███░░███░░███  ░░░░░███ ░░░███░   ░░███  ███░░███░░███░░███  ███░░
  // ░███░░░░░███  ░███ ░███  ░███  ░███ ░███ ░███   ███████   ░███     ░███ ░███ ░███ ░███ ░███ ░░█████
  // ░███    ░███  ░███ ░███  ░███  ░███ ░███ ░███  ███░░███   ░███ ███ ░███ ░███ ░███ ░███ ░███  ░░░░███
  // █████   █████ ████ █████ █████ █████░███ █████░░████████  ░░█████  █████░░██████  ████ █████ ██████
  //░░░░░   ░░░░░ ░░░░ ░░░░░ ░░░░░ ░░░░░ ░░░ ░░░░░  ░░░░░░░░    ░░░░░  ░░░░░  ░░░░░░  ░░░░ ░░░░░ ░░░░░░
  //
  //
  //

  replaceUnusedDropletIntoCan(playerId = null) {
    playerId = playerId ?? this.player_id;
    $("droplets")
      .querySelectorAll(".token")
      .forEach((elem) => {
        this.attachElementWithSlide(
          elem as HTMLElement,
          $("watercan-" + playerId)
        );
        this._counters["water-" + playerId].incValue(1);
      });
  }

  /**
   * adjust money counter
   */
  pay(playerId: number, n: number) {
    this._counters["money-" + playerId].incValue(-n);
  }

  resetMoveToken() {
    const tokens = document.querySelectorAll(".token.selectable");
    tokens.forEach((token: HTMLElement) => {
      //move token
      this.attachElementWithSlide(token, $("droplets"));
      token.classList.remove("selected");
      token.dataset.placeId = "";

      //store data
      let moves = JSON.parse($("btn-water").dataset.moves);
      //if this token was not attributed, increase by one possible moves.
      const cardId = moves[token.id];
      if (!cardId) {
        //token was in the can
        this._counters["water-" + this.player_id].incValue(-1);
      } else {
        this.possiblePlaces[cardId]++;
        delete moves[token.id];
      }

      $("btn-water").dataset.moves = JSON.stringify(moves);
    });
    $("btn-water").dataset.remainingDroplets = this.getArgs().water;
    $("btn-reset").style.display = "none";
    $("btn-water").style.display = "inline-block";
  }

  planMoveToken(cardId: number = null) {
    //check if move is possible
    if (this.possiblePlaces[cardId] == 0) {
      this.showMessage(_("This card is full"), "error");
      return;
    }

    const card = this._stocks[this.player_id]
      .getCards()
      .find((card) => card.id == +cardId);

    //select token
    const element = (document.querySelector(".token.selected") ??
      document.querySelector("#droplets .token")) as HTMLElement;
    if (!element) {
      this.showMessage(
        _(
          "There are no droplet to place left, but you can select a droplet to move"
        ),
        "error"
      );
      return;
    }
    //move token
    const [busyPlaces, availablePlaces] = this._tokenManager.getAvailablePlaces(
      card,
      this._cardManager.getCardElement(card)
    );

    element.dataset.placeId = availablePlaces[0].toString();

    this._tokenManager.moveTokenOnCard(element, card);
    element.classList.remove("selected");
    this.resetTitle();

    //store data
    let moves = JSON.parse($("btn-water").dataset.moves);
    //if this token was not attributed, lower by one possible moves.
    if (moves[element.id] === undefined) {
      $("btn-water").dataset.remainingDroplets = (
        +$("btn-water").dataset.remainingDroplets - 1
      ).toString();
    } else {
      this.possiblePlaces[moves[element.id]]++;
    }
    this.possiblePlaces[cardId]--;
    moves[element.id] = cardId;
    $("btn-water").dataset.moves = JSON.stringify(moves);

    $("btn-reset").style.display = "inline-block";
  }

  /*
   █████  █████ ███████████ █████ █████        █████████ 
  ░░███  ░░███ ░█░░░███░░░█░░███ ░░███        ███░░░░░███
   ░███   ░███ ░   ░███  ░  ░███  ░███       ░███    ░░░ 
   ░███   ░███     ░███     ░███  ░███       ░░█████████ 
   ░███   ░███     ░███     ░███  ░███        ░░░░░░░░███
   ░███   ░███     ░███     ░███  ░███      █ ███    ░███
   ░░████████      █████    █████ ███████████░░█████████ 
	░░░░░░░░      ░░░░░    ░░░░░ ░░░░░░░░░░░  ░░░░░░░░░  
  */

  getFlowerElem(color: string) {
    // debug(".token .flower ." + color);
    return document.querySelector(".token.flower." + color) as HTMLElement;
  }

  addStatics(c: Card): Card {
    Object.assign(c, CARDS_DATA[c.dataId]);
    return c;
  }

  getPlantIdOnSpaceId(spaceId): number {
    const elemId = $("plant" + spaceId).querySelector(".card.plant").id;
    return +elemId.split("_")[1];
  }

  /**
   * make active all slots where a card can be played
   * (usefull to hide useless slots)
   */
  activePossibleSlots() {
    document.querySelectorAll(".gamezone-cards").forEach((gamezone) => {
      for (let index = 0; index <= 13; index++) {
        [1, -1].forEach((side) => {
          const adjacentNumber = index == 0 ? 0 : index - 1;
          const plantElem = gamezone.querySelector(
            "[data-slot-id='plant" + index * side + "']"
          );
          const potElem = gamezone.querySelector(
            "[data-slot-id='pot" + index * side + "']"
          );
          const previousPotElem = gamezone.querySelector(
            "[data-slot-id='pot" + adjacentNumber * side + "']"
          );
          potElem.classList.toggle(
            "active",
            potElem.childNodes.length > 0 ||
              previousPotElem.childNodes.length > 0
          );
          plantElem.classList.toggle(
            "active",
            potElem.classList.contains("active")
          );
        });
      }
    });
  }

  resetDecks() {
    Object.values(this._stocks).forEach((stock) =>
      stock.setSelectionMode("none")
    );
  }

  addResetButton() {
    if ($("btn-reset")) {
      $("btn-reset").style.display = !this.isCurrentPlayerActive()
        ? "inline-block"
        : "none";
      return;
    }
    this.addSecondaryActionButton(
      "btn-reset",
      this.isCurrentPlayerActive() ? _("Reset") : _("Change mind"),
      () => {
        if (!this.isCurrentPlayerActive()) {
          this.takeAction({
            actionName: "actChangeMind",
            notActive: true,
          });
          $("btn-reset").innerText = _("Reset");
        }
        this.resetMoveToken();
      }
    );
    $("btn-reset").style.display = !this.isCurrentPlayerActive()
      ? "inline-block"
      : "none";
  }
  /*
  █████████             █████     ███                             
  ███░░░░░███           ░░███     ░░░                              
  ░███    ░███   ██████  ███████   ████   ██████  ████████    █████ 
  ░███████████  ███░░███░░░███░   ░░███  ███░░███░░███░░███  ███░░  
  ░███░░░░░███ ░███ ░░░   ░███     ░███ ░███ ░███ ░███ ░███ ░░█████ 
  ░███    ░███ ░███  ███  ░███ ███ ░███ ░███ ░███ ░███ ░███  ░░░░███
  █████   █████░░██████   ░░█████  █████░░██████  ████ █████ ██████ 
  ░░░░░   ░░░░░  ░░░░░░     ░░░░░  ░░░░░  ░░░░░░  ░░░░ ░░░░░ ░░░░░░  
																 
																 
																 
  */

  displayChoicesForDie() {
    // } //   this._diceManager.unselectAll(); //   }); //     actionName: "actModifyDie", //     value: index, //     diceIds: this._diceManager.getAllSelectedDice().map((die) => die.id), //   this.takeAction({ // callback = (index) => { // nDieToSelect = 1,
    debug("displayChoicesForDie");
  }

  updateBtnPay() {
    // let payableCosts = this.getPayableRange();
    // debug(
    //   "im paying",
    //   payableCosts,
    //   this.getArgs().cost,
    //   this._args[this.player_id].discount
    // );
    // const max =
    //   (payableCosts.length ? Math.max(...payableCosts) : 0) +
    //   this._args[this.player_id].totalDiscount;
    // if ($("egg-hint")) {
    //   $("egg-hint").textContent = `${max}/${this.getArgs().cost}`;
    // }
    // if (
    //   payableCosts.includes(
    //     this.getArgs().cost - this._args[this.player_id].totalDiscount
    //   )
    // ) {
    //   $("btn-pay").classList.remove("disabled");
    // } else {
    //   $("btn-pay").classList.add("disabled");
    // }
  }

  /*
  ██████   █████    ███████    ███████████ █████ ███████████  █████████ 
  ░░██████ ░░███   ███░░░░░███ ░█░░░███░░░█░░███ ░░███░░░░░░█ ███░░░░░███
  ░███░███ ░███  ███     ░░███░   ░███  ░  ░███  ░███   █ ░ ░███    ░░░ 
  ░███░░███░███ ░███      ░███    ░███     ░███  ░███████   ░░█████████ 
  ░███ ░░██████ ░███      ░███    ░███     ░███  ░███░░░█    ░░░░░░░░███
  ░███  ░░█████ ░░███     ███     ░███     ░███  ░███  ░     ███    ░███
  █████  ░░█████ ░░░███████░      █████    █████ █████      ░░█████████ 
  ░░░░░    ░░░░░    ░░░░░░░       ░░░░░    ░░░░░ ░░░░░        ░░░░░░░░░  
																											 
  */

  notif_moveCard(n: {
    args: {
      card: Card;
    };
  }): void {
    this._cardManager.updateCardInformations(n.args.card);
    this.activePossibleSlots();
  }

  //flag to change buttons
  notif_playerReady(n: {
    args: {
      player_id: number;
    };
  }) {
    if (this.isItMe(n.args.player_id)) {
      $("btn-water").style.display = "none";
      $("btn-reset").style.display = "inline-block";
    }
  }

  notif_updateCard(n: {
    args: {
      card: Card;
    };
  }): void {
    this._cardManager.updateCardInformations(n.args.card);
  }

  notif_updateDeck(n: { args: Partial<GameDatasCards> }) {
    this.updateCards(n.args);
    // (this._stocks["water"] as Deck<Card>).addCard(
    //   this.addStatics(n.args.water.topCard)
    // );
    // (this._stocks["water"] as Deck<Card>).setCardNumber(n.args.water.n);
  }

  notif_updatePlayers(n: { args: { [playerId: number]: Player } }) {
    this._playerManager.updatePlayers(n.args);
  }

  notif_pay(n: {
    args: {
      player_id: number;
      n: number;
      moneyPlant: Card;
    };
  }) {
    this.pay(n.args.player_id, n.args.n);
    this._cardManager.updateCardInformations(n.args.moneyPlant);
  }

  notif_transfert(n: {
    args: {
      from: Card;
      to: Card;
      n: number;
    };
  }) {
    const fromElem = this._cardManager.getCardElement(
      this.addStatics(n.args.from)
    );

    for (let index = 0; index < n.args.n; index++) {
      const element = fromElem.querySelector(".token") as HTMLElement;
      if (!element)
        debug("problem in notif transfert", index, fromElem, n.args.to);

      this._tokenManager.moveTokenOnCard(element, n.args.to);
    }
    this.wait(1000).then(() => {
      this._cardManager.updateCardInformations(n.args.from);
      this._cardManager.updateCardInformations(n.args.to);
    });
  }

  notif_drawCard(n: { args: { card: Card } }) {
    const from = n.args.card.location == "plantboard" ? "deckplant" : "deckpot";
    this._stocks["board"].addCard(n.args.card, {
      fromStock: this._stocks[from],
    });
  }

  notif_refreshUi(n: { args: GameDatas }) {
    this.updateCards(n.args.cards);
    this.activePossibleSlots();
    $("droplets").replaceChildren();
    this._playerManager.updatePlayers(n.args.players);
  }

  notif_clearTurn(n: {
    args: {
      player: Player;
      notifIds: string[];
    };
  }) {
    n.args.notifIds.forEach((logId) => {
      const log = "log_" + this._notif_uid_to_log_id[logId];
      $(log)?.classList.add("canceled");
    });
  }

  notif_startAction(n: {
    args: {
      turn: number;
    };
  }) {
    this._turnCounter.toValue(n.args.turn);
    if (n.args.turn == 12) {
      this.displayCaution();
    }
  }

  notif_newScore(n: {
    args: {
      player: Player;
      scoreDetail: any;
    };
  }) {
    this._playerManager.updateScore(n.args.player);
    //TODO display detailled score for each plant on tooltip
  }

  /*
  ███████████ ██████████ ██████   ██████ ███████████  █████         █████████   ███████████ ██████████  █████████ 
  ░█░░░███░░░█░░███░░░░░█░░██████ ██████ ░░███░░░░░███░░███         ███░░░░░███ ░█░░░███░░░█░░███░░░░░█ ███░░░░░███
  ░   ░███  ░  ░███  █ ░  ░███░█████░███  ░███    ░███ ░███        ░███    ░███ ░   ░███  ░  ░███  █ ░ ░███    ░░░ 
      ░███     ░██████    ░███░░███ ░███  ░██████████  ░███        ░███████████     ░███     ░██████   ░░█████████ 
      ░███     ░███░░█    ░███ ░░░  ░███  ░███░░░░░░   ░███        ░███░░░░░███     ░███     ░███░░█    ░░░░░░░░███
      ░███     ░███ ░   █ ░███      ░███  ░███         ░███      █ ░███    ░███     ░███     ░███ ░   █ ███    ░███
      █████    ██████████ █████     █████ █████        ███████████ █████   █████    █████    ██████████░░█████████ 
      ░░░░░    ░░░░░░░░░░ ░░░░░     ░░░░░ ░░░░░        ░░░░░░░░░░░ ░░░░░   ░░░░░    ░░░░░    ░░░░░░░░░░  ░░░░░░░░░  
																											   
																											   
																											   
	  */

  board_tpl(player: Player) {
    return `<div id='gamezone-${player.id}' class='succulents-gamezone' style='border-color:#${player.color}'>
      <div class='player-board-name' style='background-color:#${player.color}'>
        ${player.name}
      </div>
      <div id='gamezone-cards-${player.id}' class='gamezone-cards'>
        
      </div>
      
    </div>`;
  }

  // semi generic
  tplPlayerPanel(player: Player) {
    return `<div id='succulents-player-infos_${player.id}' class='player-infos'>
          <div class='money-counter counter' id='money-${player.id}'></div>
          <div id='watercan-${player.id}'></div>
          <div class='water-counter counter' id='water-${player.id}'></div>
          <div class="first-player-holder" id='first-player-${player.id}'>${
      player.isFirst ? '<div id="firstPlayer"></div>' : ""
    }</div>
        </div>`;
  }

  setupCards(gamedatas: GameDatas) {
    [/*"discardplant", "discardpot",*/ "water"].forEach((deck) => {
      this._stocks[deck] = new Deck(this._cardManager, $(deck), {
        counter: { show: true, hideWhenEmpty: true },
        autoUpdateCardNumber: false,
        topCard: gamedatas.cards[deck].topCard
          ? this.addStatics(gamedatas.cards[deck].topCard)
          : undefined,
        cardNumber: gamedatas.cards[deck].n,
      });
    });
    ["deckplant", "deckpot"].forEach((deck) => {
      this._stocks[deck] = new Deck(this._cardManager, $(deck), {
        counter: { show: true, hideWhenEmpty: false },
        autoUpdateCardNumber: true,
        cardNumber: gamedatas.cards[deck].n,
      });
    });
    this._stocks["waterboard"] = new Deck(
      this._cardManager,
      $("waterboard"),
      {}
    );
    $("waterboard").dataset.label = _("Weather :");
    this._stocks["board"] = new SlotStock(this._cardManager, $("board"), {
      slotsIds: ["pot1", "pot2", "pot3", "plant1", "plant2", "plant3"],
      mapCardToSlot: (card) => {
        card = this.addStatics(card);
        return card.type + card.state;
      },
    });
    const colors = ["red", "green", "blue", "pink", "yellow", "orange"];
    this._stocks["visibleDeck"] = new SlotStock(
      this._cardManager,
      $("visibleDeck"),
      {
        slotsIds: colors,
        mapCardToSlot: (card) => {
          card = this.addStatics(card);
          return card.color;
        },
      }
    );
    colors.forEach((color) => {
      const elem = document.querySelector(`[data-slot-id='${color}']`);
      this.addAutomaticCounter(elem as HTMLElement);
      //create flower token
      const flowerElem = document.createElement("div");
      flowerElem.classList.add("token", "flower", color);
      document.querySelector(`[data-slot-id='${color}']`).append(flowerElem);
    });

    let slotIds = [];
    for (let index = -13; index <= 13; index++) {
      slotIds.push("pot" + index);
      slotIds.push("plant" + index);
    }
    Object.keys(gamedatas.players).forEach((playerId) => {
      this._stocks[playerId] = new SlotStockForSucculents(
        this._cardManager,
        $("gamezone-cards-" + playerId),
        {
          slotsIds: slotIds,
          mapCardToSlot: (card) => {
            card = this.addStatics(card);
            return card.type + card.state;
          },
          wrap: "wrap",
        }
      );
    });

    //discard
    this._stocks["discard"] = new VoidStock(this._cardManager, $("discard"));

    this.updateCards(gamedatas.cards);
  }

  updateCards(cards: Partial<GameDatasCards>) {
    [/*"discardplant", "discardpot", */ "water"].forEach((deck) => {
      if (cards[deck]?.topCard)
        (this._stocks[deck] as Deck<Card>).addCard(
          this.addStatics(cards[deck].topCard)
        );
      if (cards[deck]?.n) {
        (this._stocks[deck] as Deck<Card>).setCardNumber(cards[deck].n);
      }
    });
    ["deckplant", "deckpot"].forEach((deck) => {
      if (cards[deck] !== undefined) {
        (this._stocks[deck] as Deck<Card>).setCardNumber(cards[deck]);
      }
    });
    ["board", "player", "visibleDeck"].forEach((deck) => {
      if (cards[deck]) {
        cards[deck].forEach((card) =>
          this._cardManager.updateCardInformations(this.addStatics(card))
        );
      }
    });

    if (cards.waterboard) {
      this._stocks["waterboard"].addCard(this.addStatics(cards.waterboard));
    }

    if (cards.flowerableColors) {
      //display available flowers
      cards.flowerableColors.forEach((color) => {
        const elem = document.querySelector(".token.flower." + color);
        document.querySelector(`[data-slot-id='${color}']`).append(elem);
      });
    }

    //remove slots of each player that are not reachable for now
    this.activePossibleSlots();
  }

  /*
    █████████  ██████████ ██████   █████ ██████████ ███████████   █████   █████████   █████████ 
    ███░░░░░███░░███░░░░░█░░██████ ░░███ ░░███░░░░░█░░███░░░░░███ ░░███   ███░░░░░███ ███░░░░░███
    ███     ░░░  ░███  █ ░  ░███░███ ░███  ░███  █ ░  ░███    ░███  ░███  ███     ░░░ ░███    ░░░ 
  ░███          ░██████    ░███░░███░███  ░██████    ░██████████   ░███ ░███         ░░█████████ 
  ░███    █████ ░███░░█    ░███ ░░██████  ░███░░█    ░███░░░░░███  ░███ ░███          ░░░░░░░░███
  ░░███  ░░███  ░███ ░   █ ░███  ░░█████  ░███ ░   █ ░███    ░███  ░███ ░░███     ███ ███    ░███
  ░░█████████  ██████████ █████  ░░█████ ██████████ █████   █████ █████ ░░█████████ ░░█████████ 
  ░░░░░░░░░  ░░░░░░░░░░ ░░░░░    ░░░░░ ░░░░░░░░░░ ░░░░░   ░░░░░ ░░░░░   ░░░░░░░░░   ░░░░░░░░░  
																							 
																							 
																							 
  */

  addTooltips() {
    this._tooltips = [
      { name: "water", hint: _("Deck of Weather Cards") },
      { name: "waterboard", hint: _("Weather at the end of this turn") },
      { name: "deckplant", hint: _("Deck of Plant Cards") },
      { name: "deckpot", hint: _("Deck of Pot Cards") },
      { name: "firstPlayer", hint: _("First player token") },
      { name: "money-counter", hint: _("Money of the player"), type: "class" },
      {
        name: "water-counter",
        hint: _("Water can of the player"),
        type: "class",
      },
    ];
    this._tooltips.forEach((tooltip: Tooltip) => {
      if (tooltip.type == "class") {
        this.addTooltipToClass(
          tooltip.name,
          tooltip.hint,
          tooltip.action ?? ""
        );
      } else {
        this.addTooltip(tooltip.name, tooltip.hint, tooltip.action ?? "");
      }
    });
  }

  addUndoButton(condition = true, callback?: Function) {
    if (condition) {
      this.addSecondaryActionButton(
        "btn-undo",
        _("Undo"),
        () => {
          this.takeAction({
            actionName: "actUndo",
          });
          if (callback) callback();
        },
        "restartAction"
      );
    }
  }

  addAutomaticCounter(elem: HTMLElement) {
    elem.classList.add("automaticCounter");
    let observer = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach((record) => {
        (record.target as HTMLElement).dataset.nb = (
          record.target as HTMLElement
        )
          .querySelectorAll(".card")
          .length.toString();
      });
    });
    observer.observe(elem, { childList: true });
  }

  insertIcons(text: string, preventRecursion = false): string {
    const translations: any = [
      // [
      //   /<([-+]\d)\s(egg|damage|die|life|tactic|nird|gnome|scientist)>/gm,
      //   "numberedIcon",
      // ],
      ["<vp>", "vp"],
      ["<water>", "water"],
      ["<leaf>", "leaf"],
      ["<money>", "money"],
      // [/([^<])(\/)/gm, "slash"],
    ];
    let index = 0; //assuming there is only 1 serie of indexed icons in a card
    for (const entry of translations) {
      text = text.replaceAll(
        entry[0],
        entry[2] && entry[2] == "text"
          ? (entry[1] as string)
          : entry[1] == "numberedIcon"
          ? `<span class='inline-icon icon-$2' data-nb='$1'></span>`
          : entry[1] == "indexedIcons"
          ? `<div class="box index${index++}"><span class='inline-icon icon-$1'></span>X $2</div>`
          : entry[1] == "method"
          ? this[entry[2]]()
          : (entry[0] instanceof RegExp ? "$1" : "") + //assuming that all regex have a first capturing group useless
            `<span class='inline-icon icon-${entry[1]}'></span>`
      );
    }
    return text;
  }

  createNumberButtons(
    callback: Function,
    valuesToDisable: number[] = [],
    from = 1,
    to = 6
  ) {
    for (let index = from; index <= to; index++) {
      if (!$("btn-" + index)) {
        this.addActionButton("btn-" + index, "" + index, () => {
          callback(index);
        });
      }
      const elem = $("btn-" + index);
      elem.style.display = "inline-block";
      elem.classList.toggle("disabled", valuesToDisable.includes(index));
    }
  }

  /**
   * Return sum of numbers
   * @param array numbers to sum
   * @returns
   */
  arraySum(array: number[]) {
    return array.reduce(
      (previousValue, currentValue) => currentValue + previousValue,
      0
    );
  }

  //reset the client state (and perform some extra actions if needed)
  addResetClientStateButton(callback?: Function, customLabel = undefined) {
    this.addSecondaryActionButton(
      "btn-cancel",
      customLabel ?? _("Cancel"),
      () => {
        if (callback) callback();
        else this.clearPossible();
        this.restoreServerGameState();
      }
    );
  }

  addPassButton(condition = true, callback?: Function, actionName = "actDeny") {
    if (condition) {
      this.addSecondaryActionButton("btn-pass", _("Pass"), () => {
        this.takeAction({
          actionName: actionName,
        });
        if (callback) callback();
      });
    }
  }

  displayTitle(title: string) {
    const formatedTitle = this.fsr(title, { you: this.coloredYou() });
    $("pagemaintitletext").innerHTML = formatedTitle;
  }

  resetTitle() {
    this.displayTitle(this.currentStateTitle);
  }

  displayCaution(text?: string, bErasePrevious = true) {
    text = text ?? _("Caution: this is the last turn !");
    dojo.place(
      '<div id="LSU_message">' + text + "</div>",
      "LSU_caution",
      bErasePrevious ? "only" : "first"
    );
    dojo.connect($("LSU_caution"), "onclick", this, () => {
      dojo.destroy("LSU_message");
    });
  }

  /*
   *   Create and place a counter in a div container
   */
  addCounterOnDeck(containerId, initialValue) {
    const counterId = containerId + "_deckinfo";
    const div = `<div id="${counterId}" class="deckinfo">0</div>`;
    dojo.place(div, containerId);
    const counter = this.createCounter(counterId, initialValue);
    if (initialValue) $(containerId).classList.remove("empty");
    return counter;
  }

  /**
   * This method can be used instead of addActionButton, to add a button which is an image (i.e. resource). Can be useful when player
   * need to make a choice of resources or tokens.
   */
  addImageActionButton(
    id: string,
    handler: string | eventhandler,
    tooltip: any,
    classes = null,
    bcolor = "blue"
  ) {
    if (classes) classes.push("shadow bgaimagebutton");
    else classes = ["shadow bgaimagebutton"];

    // this will actually make a transparent button id color = blue
    this.addActionButton(id, "", handler, "customActions", false, bcolor);
    // remove border, for images it better without
    dojo.style(id, "border", "none");
    // but add shadow style (box-shadow, see css)
    dojo.addClass(id, classes.join(" "));
    dojo.removeClass(id, "bgabutton_blue");
    // you can also add additional styles, such as background
    if (tooltip) {
      dojo.attr(id, "title", tooltip);
    }
    return $(id);
  }

  /*
   * briefly display a card in the center of the screen
   */
  // showCard(card: any, autoClose = false, nextContainer: any) {
  //   if (!card) return;

  //   dojo.place("<div id='card-overlay'></div>", "ebd-body");
  //   // let duplicate = card.cloneNode(true);
  //   // duplicate.id = duplicate.id + ' duplicate';
  //   this.genericMove(card, $("card-overlay"), 0, false);
  //   // $('card-overlay').appendChild(card);
  //   $("card-overlay").offsetHeight;
  //   $("card-overlay").classList.add("active");

  //   let close = () => {
  //     this.genericMove(card, $(nextContainer), 0, false);
  //     $("card-overlay").classList.remove("active");
  //     this.wait(500).then(() => {
  //       $("card-overlay").remove();
  //     });
  //   };

  //   if (autoClose) this.wait(2000).then(close);
  //   else $("card-overlay").addEventListener("click", close);
  // }

  /*
   *
   * To add div in logs
   *
   */

  getTokenDiv(key, args) {
    debug("getTokenDiv", key, args);
    // ... implement whatever html you want here, example from sharedcode.js
    var token_id = args[key];
    switch (key) {
      case "attack":
        return `<span class="${
          args[this.getActivePlayerId()]["canAttack"] ? "" : "no"
        }">${token_id}</span>`;
      case "recruit":
        return `<span class="${
          args[this.getActivePlayerId()]["canRecruit"] ? "" : "no"
        }">${token_id}</span>`;
      case "trade":
        return `<span class="${
          args[this.player_id]["canTrade"] ? "" : "no"
        }">${token_id}</span>`;

      case "tactic":
        return `<span class="${
          args[this.player_id]["canTactic"] ? "" : "no"
        }">${token_id}</span>`;

      default:
        return token_id;
    }
  }

  isItMe(playerId: number | string) {
    return playerId == parseInt(this.player_id);
  }

  // █████  █████  █████     ███  ████
  //░░███  ░░███  ░░███     ░░░  ░░███
  // ░███   ░███  ███████   ████  ░███   █████
  // ░███   ░███ ░░░███░   ░░███  ░███  ███░░
  // ░███   ░███   ░███     ░███  ░███ ░░█████
  // ░███   ░███   ░███ ███ ░███  ░███  ░░░░███
  // ░░████████    ░░█████  █████ █████ ██████
  //  ░░░░░░░░      ░░░░░  ░░░░░ ░░░░░ ░░░░░░
  //
  //
  //
  forEachPlayer(callback) {
    Object.values(this.gamedatas.players).forEach(callback);
  }

  getArgs() {
    return this.gamedatas.gamestate.args;
  }

  clientState(name, descriptionmyturn, args) {
    args.you = this.coloredYou();
    this.setClientState(name, {
      descriptionmyturn,
      args,
    });
  }

  strReplace(str, subst) {
    return dojo.string.substitute(str, subst);
  }

  clearClientState() {
    this.clearPossible();
    this.restoreServerGameState();
  }

  translate(t) {
    if (typeof t === "object") {
      return this.format_string_recursive(t.log, t.args);
    } else {
      return _(t);
    }
  }

  fsr(log, args) {
    return this.format_string_recursive(log, args);
  }

  onSelectN(elements, n, callback) {
    let selectedElements = [];
    let updateStatus = () => {
      if ($("btnConfirmChoice")) $("btnConfirmChoice").remove();
      if (selectedElements.length == n) {
        this.addPrimaryActionButton("btnConfirmChoice", _("Confirm"), () => {
          if (callback(selectedElements)) {
            selectedElements = [];
            updateStatus();
          }
        });
      }

      if ($("btnCancelChoice")) $("btnCancelChoice").remove();
      if (selectedElements.length > 0) {
        this.addSecondaryActionButton("btnCancelChoice", _("Cancel"), () => {
          selectedElements = [];
          updateStatus();
        });
      }

      Object.keys(elements).forEach((id) => {
        let elt = elements[id];
        let selected = selectedElements.includes(id);
        elt.classList.toggle("selected", selected);
        elt.classList.toggle(
          "selectable",
          selected || selectedElements.length < n
        );
      });
    };

    Object.keys(elements).forEach((id) => {
      let elt = elements[id];

      this.onClick(elt, () => {
        let index = selectedElements.findIndex((t) => t == id);

        if (index === -1) {
          if (selectedElements.length >= n) return;
          selectedElements.push(id);
        } else {
          selectedElements.splice(index, 1);
        }
        updateStatus();
      });
    });
  }
}
