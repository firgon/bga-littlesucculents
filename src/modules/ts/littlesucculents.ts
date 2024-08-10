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
  public gamedatas: GameDatas;
  public _stocks: { [stockId: string]: Deck<Card> | SlotStock<Card> };
  public _cardManager: MyCardManager<Card>;
  public _animationManager: AnimationManager;

  constructor() {
    super();
    this._activeStates = ["play"];
    this._notifications = [
      ["updatePlayers", 0],
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

    // Setting up player boards
    this.setupPlayers(gamedatas);

    this.setupCards(gamedatas);

    $("ebd-body").classList.toggle(
      "two-players",
      Object.keys(gamedatas.players).length == 2
    );

    //create zoom panel and define Utils
    this.setupZoomUI();

    //add general tooltips

    // add shortcut and navigation

    //add cheat block if cheatModule is active
    if (gamedatas.cheatModule) {
      this.cheatModuleSetup(gamedatas);
    }

    this.adaptWidth();
    this.inherited(arguments);
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

  // onLeavingStateAttack(): void {
  //   this._diceManager.unActivateAll(false);
  // }

  onEnteringStatePlay(args: {
    buyableCards: { [cardId: number]: Card };
    cuttableCards: { [cardId: number]: Card };
    flowerableCards: { [cardId: number]: string[] };
    possiblePlaces: { plant: number[]; pot: number[] };
  }) {
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
    if (Object.values(args.flowerableCards).length > 0) {
      this.addActionButton("btn-flower", _("Flower a plant"), () => {
        this.clientState(
          "clientFlower",
          _("${you} can choose a plant to flower"),
          {
            flowerableCards: args.flowerableCards,
          }
        );
      });
    }
    this.addActionButton("btn-tend", _("Tend"), () => {
      this.clientState("clientTend", _("${you} can choose a plant to flower"), {
        flowerableCards: args.flowerableCards,
      });
    });
  }

  onLeavingStateClientBuy(): void {
    this._stocks["board"].setSelectionMode("none");
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
      if (selection.includes(lastChange)) {
        args.possiblePlaces[lastChange.type].forEach((slotId) => {
          debug("J'active ", lastChange.type + slotId);
          this.onClick(lastChange.type + slotId, () => {
            this.takeAction({
              actionName: "actBuy",
              cardId: lastChange.id,
              state: slotId,
            });
          });
        });
      } else {
        this.clearSelectable();
      }
    };
    this.addResetClientStateButton();
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

  // rollDiceOnACard(cardId: number, dice: { [dieId: number]: NRDice }) {
  //   const stock: DiceStock = this._diceStocks[cardId];
  //   stock.rollDice(Object.values(dice));
  // }

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

  // getDiceSum(dice?: NRDice[]): number {
  //   const selectedDice = dice ?? this._diceManager.getAllSelectedDice();
  //   return selectedDice.reduce(
  //     (previousValue, currentValue) => currentValue.face + previousValue,
  //     0
  //   );
  // }

  addStatics(c: Card): Card {
    Object.assign(c, CARDS_DATA[c.dataId]);
    return c;
  }

  /**
   * make active all slots where a card can be played
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

  // notif_moveDie(n: {
  //   args: {
  //     player_id: number;
  //     player_name: string;
  //     die: NRDice;
  //     cardId: number;
  //     cardsAndDice: TradeArgs;
  //   };
  // }): void {
  //   debug("notif_moveDie", n);
  //   this.moveDie(n.args.die, n.args.cardId);
  // }

  /*
  ██████   ██████    ███████    █████   █████ ██████████  █████████ 
  ░░██████ ██████   ███░░░░░███ ░░███   ░░███ ░░███░░░░░█ ███░░░░░███
  ░███░█████░███  ███     ░░███ ░███    ░███  ░███  █ ░ ░███    ░░░ 
  ░███░░███ ░███ ░███      ░███ ░███    ░███  ░██████   ░░█████████ 
  ░███ ░░░  ░███ ░███      ░███ ░░███   ███   ░███░░█    ░░░░░░░░███
  ░███      ░███ ░░███     ███   ░░░█████░    ░███ ░   █ ███    ░███
  █████     █████ ░░░███████░      ░░███      ██████████░░█████████ 
  ░░░░░     ░░░░░    ░░░░░░░         ░░░      ░░░░░░░░░░  ░░░░░░░░░  
  */

  // moveCard(card: CardFromDb) {
  //   let elem = this._cardManager.updateCard(card);

  //   this.genericMove(elem.getElementId(), elem.getCardContainer());
  // }

  // moveDice(selection: BgaDie[], cardId: number) {
  //   debug("moveDice", selection, cardId);
  //   this._diceStocks[cardId].addDice(selection);
  // }

  // moveDie(selection: BgaDie, cardId: number) {
  //   debug("moveDie", selection, cardId);
  //   this._diceStocks[cardId].addDie(selection);
  // }

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

  setupCards(gamedatas: GameDatas) {
    [/*"discardplant", "discardpot",*/ "water"].forEach((deck) => {
      this._stocks[deck] = new Deck(this._cardManager, $(deck), {
        counter: { show: true, hideWhenEmpty: true },
        autoUpdateCardNumber: false,
        autoRemovePreviousCards: true,
        topCard: this.addStatics(gamedatas.cards[deck].topCard),
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
    $("waterboard").dataset.label = _("Next weather :");
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

    this.updateCards(gamedatas.cards);
  }

  updateCards(cards: GameDatasCards) {
    [/*"discardplant", "discardpot", */ "water"].forEach((deck) => {
      if (cards[deck].topCard)
        this._stocks[deck].addCard(this.addStatics(cards[deck].topCard));
    });
    ["deckplant", "deckpot"].forEach((deck) => {
      (this._stocks[deck] as Deck<Card>).setCardNumber(cards[deck]);
    });
    cards.board.forEach((card) =>
      this._stocks["board"].addCard(this.addStatics(card))
    );
    cards.player.forEach((card) => this._stocks[card.playerId].addCard(card));
    cards.visibleDeck.forEach((card) =>
      this._stocks["visibleDeck"].addCard(this.addStatics(card))
    );

    this._stocks["waterboard"].addCard(this.addStatics(cards.waterboard));

    //display available flowers
    cards.flowerableColors.forEach((color) => {
      const elem = document.createElement("div");
      elem.classList.add("token", "flower", color);
      document.querySelector(`[data-slot-id='${color}']`).append(elem);
    });

    //remove slots of each player that are not reachable for now
    this.activePossibleSlots();
  }

  //           ████
  //          ░░███
  // ████████  ░███   ██████   █████ ████  ██████  ████████   █████
  //░░███░░███ ░███  ░░░░░███ ░░███ ░███  ███░░███░░███░░███ ███░░
  // ░███ ░███ ░███   ███████  ░███ ░███ ░███████  ░███ ░░░ ░░█████
  // ░███ ░███ ░███  ███░░███  ░███ ░███ ░███░░░   ░███      ░░░░███
  // ░███████  █████░░████████ ░░███████ ░░██████  █████     ██████
  // ░███░░░  ░░░░░  ░░░░░░░░   ░░░░░███  ░░░░░░  ░░░░░     ░░░░░░
  // ░███                       ███ ░███
  // █████                     ░░██████
  //░░░░░                       ░░░░░░
  setupPlayers(gamedatas: GameDatas) {
    for (const playerId in gamedatas.players) {
      const player = gamedatas.players[playerId];

      this.place("tplPlayerPanel", player, "overall_player_board_" + playerId);

      this._counters["water-" + playerId] = this.createCounter(
        "water-" + playerId,
        player.water
      );

      this._counters["money-" + playerId] = this.createCounter(
        "money-" + playerId,
        player.money
      );

      this.place("board_tpl", player, "table");
    }

    //add general tooltips
    this.myUpdatePlayerOrdering("gamezone", "table");

    // dojo.place(
    //   '<div id="firstPlayer" class="firstPlayer"></div>',
    //   "overall_player_board_" + gamedatas.firstPlayer
    // );

    // this.addTooltip("firstPlayer", _("First player"), "");
  }

  /**
   * Update player Panel (firstPlayer token, scores...)
   * TODO
   * @param players
   */
  updatePlayers(players: { [playerId: number]: Player }) {}

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
      <div class='money counter' id='money-${player.id}'></div>
      <div class='water counter' id='water-${player.id}'></div>
      <div class="first-player-holder" id='first-player-${player.id}'>${
      player.isFirst ? '<div id="firstPlayer"></div>' : ""
    }</div>
    </div>`;
  }

  getPlayers() {
    return Object.values(this.gamedatas.players);
  }

  getColoredName(pId: number) {
    let name = this.gamedatas.players[pId].name;
    return this.coloredPlayerName(name);
  }

  getPlayerColor(pId: number) {
    return this.gamedatas.players[pId].color;
  }

  isSolo() {
    return this.getPlayers().length == 1;
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
  addResetClientStateButton(callback?: Function) {
    this.addSecondaryActionButton("btn-cancel", _("Cancel"), () => {
      this.restoreServerGameState();
      if (callback) callback();
    });
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

  //place each player board in good order.
  myUpdatePlayerOrdering(elementName: string, container: string): void {
    for (let i in this.gamedatas.playerorder) {
      const playerId = this.gamedatas.playerorder[i];
      dojo.place(elementName + "-" + playerId, container, "last");
    }
  }

  displayTitle(title: string) {
    $("pagemaintitletext").innerHTML = _(title);
  }

  displayCaution() {
    let text = _("Caution: this is the last turn !");
    dojo.place(
      '<div id="NRD_message">' + text + "</div>",
      "NRD_caution",
      "first"
    );
    dojo.connect($("NRD_caution"), "onclick", this, () => {
      dojo.destroy("NRD_message");
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
  showCard(card: any, autoClose = false, nextContainer: any) {
    if (!card) return;

    dojo.place("<div id='card-overlay'></div>", "ebd-body");
    // let duplicate = card.cloneNode(true);
    // duplicate.id = duplicate.id + ' duplicate';
    this.genericMove(card, "card-overlay", false);
    // $('card-overlay').appendChild(card);
    $("card-overlay").offsetHeight;
    $("card-overlay").classList.add("active");

    let close = () => {
      this.genericMove(card, nextContainer, false);
      $("card-overlay").classList.remove("active");
      this.wait(500).then(() => {
        $("card-overlay").remove();
      });
    };

    if (autoClose) this.wait(2000).then(close);
    else $("card-overlay").addEventListener("click", close);
  }

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

  genericMove(elemId, newContainerId, fastMode = false, position = null) {
    debug("genericMove", elemId, newContainerId);
    const el = $(elemId);

    if (this.isFastMode() || (fastMode && this.isCurrentPlayerActive())) {
      if (position == "first") $(newContainerId).prepend(el);
      else $(newContainerId).appendChild(el);
      return;
    }

    const first = el.getBoundingClientRect();

    // Now set the element to the last position.
    if (position == "first") $(newContainerId).prepend(el);
    else $(newContainerId).appendChild(el);

    const last = el.getBoundingClientRect();

    const invertY = first.top - last.top;
    const invertX = first.left - last.left;

    el.style.transform = `translate(${invertX}px, ${invertY}px)`;

    setTimeout(function () {
      el.classList.add("animate-on-transforms");
      el.style.transform = "";
    }, 50);

    // setTimeout(function() {
    el.addEventListener("transitionend", () => {
      el.classList.remove("animate-on-transforms");
    });
    // }, 20);
  }

  isItMe(playerId: number | string) {
    return playerId == parseInt(this.player_id);
  }
}
