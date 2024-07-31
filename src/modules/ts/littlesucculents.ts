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
  private players: { [playerId: number]: Player };
  private playerNumber: number;
  private _settingsConfig: any;
  public _stocks: CardStock<Card>[];
  public _cardManager: MyCardManager<Card>;
  // _diceManager: NRDiceManager;
  // public _diceStocks: { [playerId: number]: LineDiceStock };
  // private _cardManager: CardManager;
  // private _tradeManager: TradeManager;
  // public _args: { [playerId: number]: CardsAndDiceToActivateArgs };

  constructor() {
    super();
    this._activeStates = ["play"];
    this._notifications = [
      ["moveDie", 50],
      ["drawDie", 0],
      // ['completeOtherHand', 1000, (notif) => notif.args.player_id == this.player_id],
    ];

    // Fix mobile viewport (remove CSS zoom)
    this.default_viewport = "width=800";

    this._counters = {};
    this._stocks = [];
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

    //create decks as bga stock + deckInfos
    // this.counters['deck'] = this.addCounterOnDeck('deck', gamedatas.cards.deck_count);
    // this.setupMarket(gamedatas.cards);

    // Setting up player boards
    this.setupPlayers(gamedatas);

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

  onEnteringStateAttack(args: {
    // attackingCard: CardFromDb;
    // dice: { [dieId: number]: NRDice };
    // n: number;
    // choosableGnomes: number[];
    // cardsAndDice: TradeArgs;
    // canSplit: boolean;
    // canReroll: boolean;
  }) {}

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

  displayChoicesForDie() // nDieToSelect = 1,
  // callback = (index) => {
  //   this.takeAction({
  //     diceIds: this._diceManager.getAllSelectedDice().map((die) => die.id),
  //     value: index,
  //     actionName: "actModifyDie",
  //   });
  //   this._diceManager.unselectAll();
  // }
  {
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

  // setupTrading(trades: tradeFromDb[]) {
  //   const title = _("Dice trading");
  //   $("trading-title").textContent = title;

  //   trades.forEach((trade) => {
  //     this._tradeManager.addObject(new Trade(trade));
  //   });
  // }

  updateDeckGnomes(n: number, level: number) {
    if (!this._counters["deckGnomes"]) {
      this._counters["deckGnomes"] = this.addCounterOnDeck("deckGnomes", n);
    } else {
      this._counters["deckGnomes"].toValue(n);
    }
    $("deckGnomes").dataset.level = "" + level;
  }

  // semi generic
  tplPlayerPanel(player: Player): string {
    //   const firstPlayerToken =
    //     player.firstPlayer == 1
    //       ? '<div id="firstPlayerToken" class="first-player">1st</div>'
    //       : "";
    //   return `<div id='littlesucculents-player-infos_${player.id}' class='player-infos'>
    // <div class='lives-counter counter' id='lives-counter-${player.id}'>0</div>
    // ${firstPlayerToken}
    // </div>`;
    return "";
  }

  table_tpl(player: Player): string {
    debug("table_tpl", player);
    return `<div id="player_table_${player.id}" class="player_table" style="border-color:#${player.color}">
	<div class="title" style="background-color:#${player.color}">${player.name}</div>
		<div id="gnomes_row_${player.id}" class="cards_row">
      <div class="fakeComponent"></div>
			<div id="dice_stock_${player.id}"  class="dice_stock"></div>
		</div>
		<div id="littlesucculents_row_${player.id}" class="cards_row"></div>
	</div>`;
  }

  card_tpl(card: Card, extraclass: string = ""): string {
    return "";
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
    let index = 0;
    for (let i in this.gamedatas.playerorder) {
      const playerId = this.gamedatas.playerorder[i];
      dojo.place(elementName + "_" + playerId, container, index);
      index++;
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
