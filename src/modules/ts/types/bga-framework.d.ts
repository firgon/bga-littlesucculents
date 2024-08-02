declare var gameui: GameGui;
declare var g_replayFrom: number | undefined;
declare var g_gamethemeurl: string;
declare var g_themeurl: string;
declare var g_archive_mode: boolean;
declare function _(str: string): string;
declare function __(site: string, str: string): string;
declare function $(text: string | Element): HTMLElement;

declare const define;
declare const ebg;
declare const dojo;
declare const dijit;
declare const littlesucculents;
declare const customgame;
declare type eventhandler = (event?: any) => void;

type ElementOrId = Element | string;
type StringProperties = { [key: string]: string };

declare class GameNotifQueue {
  /**
   * Set the notification deinfed by notif_type as "synchronous"
   * @param notif_type - the type of notification
   * @param duration - the duration of notification wait in milliseconds
   * If "duration" is specified: set a simple timer for it (milliseconds)
   * If "duration" is not specified, the notification handler MUST call "setSynchronousDuration"
   */
  setSynchronous(notif_type: string, duration?: number): void;
  /**
   * Set dynamically the duration of a synchronous notification
   * MUST be called if your notification has not been associated with a duration in "setSynchronous"
   * @param duration - how long to hold off till next notficiation received (milliseconds)
   */
  setSynchronousDuration(duration: number): void;

  /**
   * Ignore notification if predicate is true
   * @param notif_type  - the type of notificatio
   * @param predicate - the function that if returned true will make framework not dispatch notification.
   * NOTE: this cannot be used for syncronious unbound notifications
   */
  setIgnoreNotificationCheck(
    notif_type: string,
    predicate: (notif: object) => boolean
  ): void;
}
// declare interface Notif {
//   type: string; // type of the notification (as passed by php function)
//   log: string; // the log string passed from php notification
//   args: any; // This is the arguments that you passed on your notification method on php
//   bIsTableMsg: boolean; // is true when you use [[Main_game_logic:_yourgamename.game.php#NotifyAllPlayers|NotifyAllPlayers]] method (false otherwise)
//   channelorig: string; // information about table ID (formatted as : "/table/t[TABLE_NUMBER]")
//   gamenameorig: string; // name of the game
//   move_id: number; // ID of the move associated with the notification
//   table_id: number; // ID of the table (comes as string)
//   time: number; // UNIX GMT timestamp
//   uid: number; // unique identifier of the notification
//   h: string; // unknown
// }
declare class Counter {
  speed: number;

  create(target: string): void; //  associate counter with existing target DOM element
  getValue(): number; //  return current value
  incValue(by: number): number; //  increment value by "by" and animate from previous value
  setValue(value: number): void; //  set value, no animation
  toValue(value: number): void; // set value with animation
  disable(): void; // Sets value to "-"
}

declare class GameGui implements Game {
  page_is_unloading: any;
  game_name: string;
  instantaneousMode: boolean;
  player_id: string;
  interface_min_width: number;
  gamedatas: any;
  isSpectator: boolean;
  bRealtime: boolean;
  notifqueue: GameNotifQueue;
  last_server_state: any;
  scoreCtrl: { [player_id: number]: Counter };
  on_client_state: boolean;
  tooltips: string[];
  is_client_only: boolean;
  prefs: any[];
  table_id: number;
  metasiteurl: string;
  stateName: string;

  isCurrentPlayerActive(): boolean;
  getActivePlayerId(): number;
  getActivePlayers(): string[];
  addActionButton(
    id: string,
    label: string,
    method: string | eventhandler,
    destination?: string,
    blinking?: boolean,
    color?: string
  ): void;
  checkAction(action: any): boolean;
  ajaxcall(
    url: string,
    args: object,
    bind: GameGui,
    resultHandler: (result: any) => void,
    allHandler: (err: any) => void
  ): void;
  connect(node: ElementOrId, ontype: string, handler: any): void;
  disconnect(node: ElementOrId, ontype: string): void;
  connectClass(cls: string, ontype: string, handler: any): void;

  setup(gamedatas: object): void;
  onEnteringState(stateName: string, args: { args: any } | null): void;
  onLeavingState(stateName: string): void;
  onUpdateActionButtons(stateName: string, args: any): void;
  setupNotifications(): void;

  setClientState(newState: string, args: object): void;
  restoreServerGameState(): void;

  showMessage(msg: string, type: string): void;
  showMoveUnauthorized(): void;
  onScriptError(msg: string, url?: string, linenumber?: number): void;
  inherited(args: any): any;
  format_string_recursive(log: string, args: any[]): string;
  clienttranslate_string(text: string): string;

  onScreenWidthChange(): void;

  slideToObject(
    mobile_obj: string | Element,
    target_obj: string | Element,
    duration?: number,
    delay?: number
  ): Animation;
  slideToObjectPos(
    mobile_obj: string | Element,
    target_obj: string | Element,
    target_x: number,
    target_y: number,
    duration?: number,
    delay?: number
  ): Animation;
  slideTemporaryObject(
    mobile_obj_html: string,
    mobile_obj_parent: string | Element,
    from: string | Element,
    to: string | Element,
    duration?: number,
    delay?: number
  ): Animation;

  displayScoring(
    anchor_id: string,
    color: string,
    score: number | string,
    duration?: number,
    offset_x?: number,
    offset_y?: number
  ): void;
  showBubble(
    anchor_id: string,
    text: string,
    delay?: number,
    duration?: number,
    custom_class?: string
  ): void;
  updateCounters(counters: any): void;

  addTooltip(
    nodeId: string,
    helpStringTranslated: string,
    actionStringTranslated: string,
    delay?: number
  ): void;
  addTooltipHtml(nodeId: string, html: string, delay?: number): void;
  addTooltipHtmlToClass(cssClass: string, html: string, delay?: number): void;
  addTooltipToClass(
    cssClass: string,
    helpStringTranslated: string,
    actionStringTranslated: string,
    delay?: number
  ): void;
  removeTooltip(nodeId: string): void;

  confirmationDialog(
    message: string,
    yesHandler: (param: any) => void,
    noHandler?: (param: any) => void,
    param?: any
  ): void;
  multipleChoiceDialog(
    message: string,
    choices: any[],
    callback: (choice: number) => void
  ): void;

  enablePlayerPanel(player_id: number): void;
  disablePlayerPanel(player_id: number): void;

  //my boilerplate
  _fakeId: number;
  _counters: { [key: string]: Counter };

  //boilerplate
  changePageTitle(suffix: string, save: boolean): void;
  clientState(name: string, descriptionmyturn: string, args: {}): void;
  clearActionButtons(): void;
  setModeInstataneous(): void;
  unsetModeInstantaneous(): void;
  forEachPlayer(callback: Function): void;
  default_viewport: string;
  _activeStates: Array<string>;

  _notifications: any[];

  setupPlayers(gamedatas: GameDatas): void;
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
  onClick(node: string, callback: Function, temporary?: boolean): void;
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
    pref: number,
    autoclick?: boolean
  ): void;
  stopActionTimer(): void;
  coloredPlayerName(name: string): string;
  coloredYou(): string;
  fsr(log: string, args: {}): string;
}
/**
 * Framework interfaces
 */

interface Game {
  setup: (gamedatas: any) => void;
  onEnteringState: (stateName: string, args: any) => void;
  onLeavingState: (stateName: string) => void;
  onUpdateActionButtons: (stateName: string, args: any) => void;
  setupNotifications: () => void;

  showMessage: (msg: string, type: string) => any;

  isFastMode: () => boolean;

  setModeInstataneous: () => void;
  unsetModeInstantaneous: () => void;
}

interface Notif<T> {
  args: T;
  log: string;
  move_id: number;
  table_id: string;
  time: number;
  type: string;
  uid: string;
}

/* TODO repace Function by (..params) => void */
interface Dojo {
  place: Function;
  style: Function;
  hitch: Function;
  addClass: (nodeId: string, className: string) => {};
  removeClass: (nodeId: string, className?: string) => {};
  toggleClass: (nodeId: string, className: string, forceValue: boolean) => {};
  connect: Function;
  query: Function;
  subscribe: Function;
  string: any;
  fx: any;
  marginBox: Function;
  fadeIn: Function;
  trim: Function;
}

type Gamestate = any; // TODO
