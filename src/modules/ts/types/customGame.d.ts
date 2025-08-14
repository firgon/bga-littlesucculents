declare const BgaAutofit;
declare const BgaAnimations;
declare const gretchensgarden;
declare const customgame;

declare type Tooltip = {
  name: string;
  hint: string;
  action?: string;
  type?: undefined | "class";
};

interface GameGui {
  inherited(args: any): any;
  stateName: string;
  //my boilerplate
  _fakeId: number;
  _counters: { [key: string]: Counter };
  _tooltips: Tooltip[];
  _animationManager: AnimationManager;
  _turnCounter: TurnCounter;

  //boilerplate
  changePageTitle(suffix?: string, save?: boolean): void;
  clientState(name: string, descriptionmyturn: string, args: {}): void;
  clearActionButtons(): void;
  setModeInstataneous(): void;
  unsetModeInstantaneous(): void;
  forEachPlayer(callback: Function): void;
  default_viewport: string;

  _nonActiveStates: Array<string>;
  _selectableNodes; //used for temporary clickable nodes
  _notifications: any[];

  setupZoomUI: Function;
  cheatModuleSetup: Function;
  adaptWidth(): void;
  addPrimaryActionButton(
    id: string,
    text: string,
    callback: Function,
    zone?: string
  ): void;

  addSecondaryActionButton(
    id: string,
    text: string,
    callback: Function,
    zone?: string
  ): void;
  addDangerActionButton(
    id: string,
    text: string,
    callback: Function,
    zone?: string
  ): void;
  createCounter(id: string, initialValue: number): Counter;
  wait(duration: number): Promise<any>;
  isFastMode(): boolean;
  place(
    tplMethodName: string,
    object: any,
    container: string,
    position?: string
  ): void;

  getArgs(): any;

  addCustomTooltip(id: string, html: string, delay?: number): void;
  onClick(
    node: string | Element,
    callback: Function,
    temporary?: boolean
  ): void;
  clearSelectable(): void;
  clearPossible(): void;
  clearClientState(): void;
  takeAction(
    data: { actionName?: string; notActive?: boolean; [key: string]: any },
    action?: string,
    check?: boolean,
    checklock?: boolean
  ): void;
  startActionTimer(
    buttonId: string,
    time: number,
    pref?: number,
    autoclick?: boolean
  ): void;
  stopActionTimer(): void;
  coloredPlayerName(name: string): string;
  currentStateTitle: string;
  coloredYou(): string;
  fsr(log: string, args: {}): string;
  _notif_uid_to_log_id: {
    [notif_uid: string]: number;
  };
}

interface Game extends GameGui {}

interface Player {
  water: number;
  money: number;
  isFirst: boolean;
  scoreDetails: {
    [cardId: number]: [
      scoreForFlower: number,
      scoreForLeaves: number,
      scoreForPlant: number,
      args: any
    ];
  };
}

interface GameDatasCards {
  deckpot: number;
  deckplant: number;
  board: Card[];
  player: Card[];
  discardpot: { n: number; topCard?: Card };
  discardplant: { n: number; topCard?: Card };
  water: { n: number; topCard?: Card };
  waterboard: Card;
  visibleDeck: Card[];
  flowerableColors: string[];
}

interface Gamedatas<P = Player> {
  cheatModule: boolean;
  cards: GameDatasCards;
  turn: number;
}
