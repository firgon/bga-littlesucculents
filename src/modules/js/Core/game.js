var isDebug =
  window.location.host == "studio.boardgamearena.com" ||
  window.location.hash.indexOf("debug") > -1;
var debug = isDebug ? console.info.bind(window.console) : function () {};

define([
  "dojo",
  "dojo/_base/declare",
  g_gamethemeurl + "modules/js/vendor/nouislider.min.js",
  "ebg/core/gamegui",
], (dojo, declare, noUiSlider) => {
  const isPromise = (v) =>
    typeof v === "object" && typeof v.then === "function";

  return declare("customgame.game", ebg.core.gamegui, {
    /*
     * Constructor
     */
    constructor() {
      this._notifications = [];
      this._nonActiveStates = [];
      this._connections = [];
      this._selectableNodes = [];
      this._activeStatus = null;
      this._helpMode = false;
      this._dragndropMode = false;
      this._customTooltipIdCounter = 0;
      this._registeredCustomTooltips = {};

      this._notif_uid_to_log_id = {};
      this._last_notif = null;
      dojo.place("loader_mask", "overall-content", "before");
      dojo.style("loader_mask", {
        height: "100vh",
        position: "fixed",
      });
    },

    showMessage(msg, type) {
      if (type == "error") {
        console.error(msg);
      }
      return this.inherited(arguments);
    },

    isFastMode() {
      return this.instantaneousMode;
    },

    setModeInstataneous() {
      if (this.instantaneousMode == false) {
        this.instantaneousMode = true;
        dojo.style("leftright_page_wrapper", "display", "none");
        dojo.style("loader_mask", "display", "block");
        dojo.style("loader_mask", "opacity", 1);
      }
    },

    unsetModeInstantaneous() {
      if (this.instantaneousMode) {
        this.instantaneousMode = false;
        dojo.style("leftright_page_wrapper", "display", "block");
        dojo.style("loader_mask", "display", "none");
      }
    },

    /*
     * [Undocumented] Override BGA framework functions to call onLoadingComplete when loading is done
     */
    setLoader(value, max) {
      this.inherited(arguments);
      if (!this.isLoadingComplete && value >= 100) {
        this.isLoadingComplete = true;
        this.onLoadingComplete();
      }
    },

    onLoadingComplete() {
      debug("Loading complete");
      //      this.cancelLogs(this.gamedatas.canceledNotifIds);
    },

    /*
     * Setup:
     */
    setup(gamedatas) {
      // Create a new div for buttons to avoid BGA auto clearing it
      dojo.place(
        "<div id='customActions' style='display:inline-block'></div>",
        $("generalactions"),
        "after"
      );
      dojo.place(
        "<div id='restartAction' style='display:inline-block'></div>",
        $("customActions"),
        "after"
      );

      this.attachRegisteredTooltips();

      this.setupNotifications();
      dojo.connect(this.notifqueue, "addToLog", () => {
        this.checkLogCancel(
          this._last_notif == null ? null : this._last_notif.msg.uid
        );
        this.addLogClass();
      });
    },

    /*
     * Detect if spectator or replay
     */
    isReadOnly() {
      return (
        this.isSpectator || typeof g_replayFrom != "undefined" || g_archive_mode
      );
    },

    /*
     * Make an AJAX call with automatic lock
     */
    takeAction(
      data,
      action = "actGenericAction",
      check = true,
      checkLock = true
    ) {
      lock = data.lock ?? check;
      checkAction = data.checkAction ?? checkLock;

      if (data["notActive"] != undefined) {
        lock = false;
        checkAction = false;
      }

      if (lock && !this.checkAction(action)) return false;
      if (!lock && checkAction && !this.checkLock()) return false;

      if (action == "actGenericAction") {
        data2send = { args: JSON.stringify(data) };
      } else {
        data2send = data;
      }
      debug("Sending action : ", data2send, check, checkLock);
      return this.bgaPerformAction(action, data2send, {
        lock: lock,
        checkAction: checkAction,
      });
    },

    /*
     * onEnteringState:
     * 	this method is called each time we are entering into a new game state.
     *
     * params:
     *  - str stateName : name of the state we are entering
     *  - mixed args : additional information
     */
    onEnteringState(stateName, args) {
      this.stateName = stateName; //modified
      this.currentStateTitle = args.descriptionmyturn;
      if (this.isFastMode()) return;
      if (
        !this._nonActiveStates.includes(stateName) &&
        !this.isCurrentPlayerActive()
      )
        return;

      debug("Entering state: " + stateName, args);

      //modify page title
      if (args.args && args.args.suffix && args.args.suffix != "") {
        this.changePageTitle(args.args.suffix);
        this.currentStateTitle =
          args["descriptionmyturn" + args.args.suffix] ?? "";
      }

      // Call appropriate method
      var methodName =
        "onEnteringState" +
        stateName.charAt(0).toUpperCase() +
        stateName.slice(1);
      if (this[methodName] !== undefined) this[methodName](args.args);
    },

    /**
     * onLeavingState:
     * 	this method is called each time we are leaving a game state.
     *
     * params:
     *  - str stateName : name of the state we are leaving
     */
    onLeavingState(stateName) {
      debug("Leaving state: " + stateName);
      if (this.isFastMode()) return;
      this.clearPossible();
      this.resetDecks();

      // Call appropriate method
      var methodName =
        "onLeavingState" +
        stateName.charAt(0).toUpperCase() +
        stateName.slice(1);
      if (this[methodName] !== undefined) this[methodName]();
    },

    clearPossible() {
      this.removeActionButtons();
      dojo.empty("customActions");
      dojo.empty("restartAction");

      this.clearSelectable();
    },

    clearSelectable() {
      this._connections.forEach(dojo.disconnect);
      this._connections = [];
      this._selectableNodes.forEach((node) => {
        if ($(node)) dojo.removeClass(node, "selectable selected");
      });
      this._selectableNodes = [];
      dojo.query(".unselectable").removeClass("unselectable");
    },

    /**
     * Check change of activity
     */
    onUpdateActionButtons(stateName, args) {
      if (this.isSpectator) return;
      let status = this.isCurrentPlayerActive();
      if (status != this._activeStatus) {
        debug("Update activity: " + stateName, status);
        this._activeStatus = status;

        // Call appropriate method
        var methodName =
          "onUpdateActivity" +
          stateName.charAt(0).toUpperCase() +
          stateName.slice(1);
        if (this[methodName] !== undefined) this[methodName](args, status);
      }
    },

    /*
     * setupNotifications
     */
    setupNotifications() {
      debug(this._notifications);
      this._notifications.forEach((notif) => {
        var functionName = "notif_" + notif[0];

        let wrapper = (args) => {
          let msg = this.format_string_recursive(args.log, args.args);
          if (msg != "") {
            $("gameaction_status").innerHTML = msg;
            $("pagemaintitletext").innerHTML = msg;
          }

          debug(functionName, args);
          let timing = this[functionName](args);
          if (timing === undefined) {
            if (notif[1] === undefined) {
              console.error(
                "A notification don't have default timing and didn't send a timing as return value : " +
                  notif[0]
              );
              return;
            }

            // Override default timing by 1 in case of fast replay mode
            timing = this.isFastMode() ? 0 : notif[1];
          }

          if (timing !== null && !isPromise(timing)) {
            this.notifqueue.setSynchronousDuration(timing);
          }
        };

        dojo.subscribe(notif[0], this, wrapper);
        this.notifqueue.setSynchronous(notif[0]);

        if (notif[2] != undefined) {
          this.notifqueue.setIgnoreNotificationCheck(notif[0], notif[2]);
        }
      });

      // Load production bug report handler
      dojo.subscribe("loadBug", this, (n) => this.notif_loadBug(n));

      this.notifqueue.setSynchronousDuration = (duration) => {
        setTimeout(() => dojo.publish("notifEnd", null), duration);
      };
    },

    /**
     * Load production bug report handler
     */
    notif_loadBug(n) {
      let self = this;
      function fetchNextUrl() {
        var url = n.args.urls.shift();
        console.log("Fetching URL", url, "...");
        // all the calls have to be made with ajaxcall in order to add the csrf token, otherwise you'll get "Invalid session information for this action. Please try reloading the page or logging in again"
        self.ajaxcall(
          url,
          {
            lock: true,
          },
          self,
          function (success) {
            console.log("=> Success ", success);

            if (n.args.urls.length > 1) {
              fetchNextUrl();
            } else if (n.args.urls.length > 0) {
              //except the last one, clearing php cache
              url = n.args.urls.shift();
              dojo.xhrGet({
                url: url,
                load: function (success) {
                  console.log("Success for URL", url, success);
                  console.log("Done, reloading page");
                  window.location.reload();
                },
                handleAs: "text",
                error: function (error) {
                  console.log("Error while loading : ", error);
                },
              });
            }
          },
          function (error) {
            if (error) console.log("=> Error ", error);
          }
        );
      }
      console.log("Notif: load bug", n.args);
      fetchNextUrl();
    },

    /*
     * Add a timer on an action button :
     * params:
     *  - buttonId : id of the action button
     *  - time : time before auto click
     *  - pref : 0 is disabled (auto-click), 1 if normal timer, 2 if no timer and show normal button
     */

    startActionTimer(buttonId, time, pref = 1, autoclick = false) {
      var button = $(buttonId);
      var isReadOnly = this.isReadOnly();
      if (button == null || isReadOnly || pref == 2) {
        debug(
          "Ignoring startActionTimer(" + buttonId + ")",
          "readOnly=" + isReadOnly,
          "prefValue=" + pref
        );
        return;
      }

      // If confirm disabled, click on button
      if (pref == 0) {
        if (autoclick) button.click();
        return;
      }

      this._actionTimerLabel = button.innerHTML;
      this._actionTimerSeconds = time;
      this._actionTimerFunction = () => {
        var button = $(buttonId);
        if (button == null) {
          this.stopActionTimer();
        } else if (this._actionTimerSeconds-- > 1) {
          button.innerHTML =
            this._actionTimerLabel + " (" + this._actionTimerSeconds + ")";
        } else {
          debug("Timer " + buttonId + " execute");
          button.click();
        }
      };
      this._actionTimerFunction();
      this._actionTimerId = window.setInterval(this._actionTimerFunction, 1000);
      debug("Timer #" + this._actionTimerId + " " + buttonId + " start");
    },

    stopActionTimer() {
      if (this._actionTimerId != null) {
        debug("Timer #" + this._actionTimerId + " stop");
        window.clearInterval(this._actionTimerId);
        delete this._actionTimerId;
      }
    },

    /*
     * Play a given sound that should be first added in the tpl file
     */
    playSound(sound, playNextMoveSound = true) {
      playSound(sound);
      playNextMoveSound && this.disableNextMoveSound();
    },

    resetPageTitle() {
      this.changePageTitle();
    },

    changePageTitle(suffix = null, save = false) {
      if (suffix == null) {
        suffix = "generic";
      }

      if (!this.gamedatas.gamestate["descriptionmyturn" + suffix]) return;

      if (save) {
        this.gamedatas.gamestate.descriptionmyturngeneric =
          this.gamedatas.gamestate.descriptionmyturn;
        this.gamedatas.gamestate.descriptiongeneric =
          this.gamedatas.gamestate.description;
      }

      this.gamedatas.gamestate.descriptionmyturn =
        this.gamedatas.gamestate["descriptionmyturn" + suffix];
      if (this.gamedatas.gamestate["description" + suffix])
        this.gamedatas.gamestate.description =
          this.gamedatas.gamestate["description" + suffix];
      this.updatePageTitle();
    },

    /*
     * Remove non standard zoom property
     */
    onScreenWidthChange() {
      dojo.style("page-content", "zoom", "");
      dojo.style("page-title", "zoom", "");
      dojo.style("right-side-first-part", "zoom", "");
    },

    /*
     * Add a blue/grey button if it doesn't already exists
     */
    addPrimaryActionButton(id, text, callback, zone = "customActions") {
      if (!$(id)) this.addActionButton(id, text, callback, zone, false, "blue");
    },

    addSecondaryActionButton(id, text, callback, zone = "customActions") {
      if (!$(id)) this.addActionButton(id, text, callback, zone, false, "gray");
    },

    addDangerActionButton(id, text, callback, zone = "customActions") {
      if (!$(id)) this.addActionButton(id, text, callback, zone, false, "red");
    },

    clearActionButtons() {
      dojo.empty("customActions");
    },

    getScale(id) {
      let transform = dojo.style(id, "transform");
      if (transform == "none") return 1;

      var values = transform.split("(")[1];
      values = values.split(")")[0];
      values = values.split(",");
      let a = values[0];
      let b = values[1];
      return Math.sqrt(a * a + b * b);
    },

    wait(n) {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), n);
      });
    },

    slide(mobileElt, targetElt, options = {}) {
      let config = Object.assign(
        {
          duration: 800,
          delay: 0,
          destroy: false,
          attach: true,
          changeParent: true, // Change parent during sliding to avoid zIndex issue
          pos: null,
          className: "moving",
          from: null,
          clearPos: true,
          beforeBrother: null,
          to: null,

          phantom: true,
        },
        options
      );
      config.phantomStart = config.phantomStart || config.phantom;
      config.phantomEnd = config.phantomEnd || config.phantom;

      // Mobile elt
      mobileElt = $(mobileElt);
      let mobile = mobileElt;
      // Target elt
      targetElt = $(targetElt);
      let targetId = targetElt;
      const newParent = config.attach ? targetId : $(mobile).parentNode;

      // Handle fast mode
      if (this.isFastMode() && (config.destroy || config.clearPos)) {
        if (config.destroy) dojo.destroy(mobile);
        else dojo.place(mobile, targetElt);

        return new Promise((resolve, reject) => {
          resolve();
        });
      }

      // Handle phantom at start
      if (config.phantomStart && config.from == null) {
        mobile = dojo.clone(mobileElt);
        dojo.attr(mobile, "id", mobileElt.id + "_animated");
        dojo.place(mobile, "game_play_area");
        this.placeOnObject(mobile, mobileElt);
        dojo.addClass(mobileElt, "phantom");
        config.from = mobileElt;
      }

      // Handle phantom at end
      if (config.phantomEnd) {
        targetId = dojo.clone(mobileElt);
        dojo.attr(targetId, "id", mobileElt.id + "_afterSlide");
        dojo.addClass(targetId, "phantom");
        if (config.beforeBrother != null) {
          dojo.place(targetId, config.beforeBrother, "before");
        } else {
          dojo.place(targetId, targetElt);
        }
      }

      dojo.style(mobile, "zIndex", 5000);
      dojo.addClass(mobile, config.className);
      if (config.changeParent) this.changeParent(mobile, "game_play_area");
      if (config.from != null) this.placeOnObject(mobile, config.from);
      return new Promise((resolve, reject) => {
        const animation =
          config.pos == null
            ? this.slideToObject(
                mobile,
                config.to || targetId,
                config.duration,
                config.delay
              )
            : this.slideToObjectPos(
                mobile,
                config.to || targetId,
                config.pos.x,
                config.pos.y,
                config.duration,
                config.delay
              );

        dojo.connect(animation, "onEnd", () => {
          dojo.style(mobile, "zIndex", null);
          dojo.removeClass(mobile, config.className);
          if (config.phantomStart) {
            dojo.place(mobileElt, mobile, "replace");
            dojo.removeClass(mobileElt, "phantom");
            mobile = mobileElt;
          }
          if (config.changeParent) {
            if (config.phantomEnd) dojo.place(mobile, targetId, "replace");
            else this.changeParent(mobile, newParent);
          }
          if (config.destroy) dojo.destroy(mobile);
          if (config.clearPos && !config.destroy)
            dojo.style(mobile, { top: null, left: null, position: null });
          resolve();
        });
        animation.play();
      });
    },

    changeParent(mobile, new_parent, relation) {
      if (mobile === null) {
        console.error("attachToNewParent: mobile obj is null");
        return;
      }
      if (new_parent === null) {
        console.error("attachToNewParent: new_parent is null");
        return;
      }
      if (typeof mobile == "string") {
        mobile = $(mobile);
      }
      if (typeof new_parent == "string") {
        new_parent = $(new_parent);
      }
      if (typeof relation == "undefined") {
        relation = "last";
      }
      var src = dojo.position(mobile);
      dojo.style(mobile, "position", "absolute");
      dojo.place(mobile, new_parent, relation);
      var tgt = dojo.position(mobile);
      var box = dojo.marginBox(mobile);
      var cbox = dojo.contentBox(mobile);
      var left = box.l + src.x - tgt.x;
      var top = box.t + src.y - tgt.y;
      this.positionObjectDirectly(mobile, left, top);
      box.l += box.w - cbox.w;
      box.t += box.h - cbox.h;
      return box;
    },

    positionObjectDirectly(mobileObj, x, y) {
      // do not remove this "dead" code some-how it makes difference
      dojo.style(mobileObj, "left"); // bug? re-compute style
      // console.log("place " + x + "," + y);
      dojo.style(mobileObj, {
        left: x + "px",
        top: y + "px",
      });
      dojo.style(mobileObj, "left"); // bug? re-compute style
    },

    /*
     * Wrap a node inside a flip container to trigger a flip animation before replacing with another node
     */
    flipAndReplace(target, newNode, duration = 1000) {
      // Fast replay mode
      if (this.isFastMode()) {
        dojo.place(newNode, target, "replace");
        return;
      }

      return new Promise((resolve, reject) => {
        // Wrap everything inside a flip container
        let container = dojo.place(
          `<div class="flip-container flipped">
            <div class="flip-inner">
              <div class="flip-front"></div>
              <div class="flip-back"></div>
            </div>
          </div>`,
          target,
          "after"
        );
        dojo.place(target, container.querySelector(".flip-back"));
        dojo.place(newNode, container.querySelector(".flip-front"));

        // Trigget flip animation
        container.offsetWidth;
        dojo.removeClass(container, "flipped");

        // Clean everything once it's done
        setTimeout(() => {
          dojo.place(newNode, container, "replace");
          resolve();
        }, duration);
      });
    },

    /*
     * Return a span with a colored 'You'
     */
    coloredYou() {
      var color = this.gamedatas.players[this.player_id].color;
      var color_bg = "";
      if (
        this.gamedatas.players[this.player_id] &&
        this.gamedatas.players[this.player_id].color_back
      ) {
        color_bg =
          "background-color:#" +
          this.gamedatas.players[this.player_id].color_back +
          ";";
      }
      var you =
        '<span style="font-weight:bold;color:#' +
        color +
        ";" +
        color_bg +
        '">' +
        __("lang_mainsite", "You") +
        "</span>";
      return you;
    },

    coloredPlayerName(name) {
      const player = Object.values(this.gamedatas.players).find(
        (player) => player.name == name
      );
      if (player == undefined)
        return (
          '<!--PNS--><span class="playername">' + name + "</span><!--PNE-->"
        );

      const color = player.color;
      const color_bg = player.color_back
        ? "background-color:#" +
          this.gamedatas.players[this.player_id].color_back +
          ";"
        : "";
      return (
        '<!--PNS--><span class="playername" style="color:#' +
        color +
        ";" +
        color_bg +
        '">' +
        name +
        "</span><!--PNE-->"
      );
    },

    /*
     * Overwrite to allow to more player coloration than player_name and player_name2
     * and add images
     */
    format_string_recursive(log, args) {
      try {
        if (log && args && !args.processed) {
          args.processed = true;

          let player_keys = Object.keys(args).filter(
            (key) => key.substr(0, 11) == "player_name"
          );
          player_keys.forEach((key) => {
            args[key] = this.coloredPlayerName(args[key]);
          });

          // list of special keys we want to replace with images
          var keys = ["point", "points"];

          for (var i in keys) {
            const key = keys[i];
            if (key in args) args[key] = this.getTokenDiv(key, args);
          }
        }
      } catch (e) {
        console.error(log, args, "Exception thrown", e.stack);
      }

      return this.inherited(arguments);
    },

    place(tplMethodName, object, container, position = null) {
      if ($(container) == null) {
        console.error(
          "Trying to place on null container",
          container,
          tplMethodName,
          object
        );
        return;
      }

      if (this[tplMethodName] == undefined) {
        console.error(
          "Trying to create a non-existing template",
          tplMethodName
        );
        return;
      }

      return dojo.place(this[tplMethodName](object), container, position);
    },

    /* Helper to work with local storage */
    getConfig(value, v) {
      return localStorage.getItem(value) == null ||
        isNaN(localStorage.getItem(value))
        ? v
        : localStorage.getItem(value);
    },

    /**********************
     ****** HELP MODE ******
     **********************/
    /**
     * Toggle help mode
     */
    toggleHelpMode(b) {
      if (b) this.activateHelpMode();
      else this.desactivateHelpMode();
    },

    activateHelpMode() {
      this._helpMode = true;
      dojo.addClass("ebd-body", "help-mode");
      this._displayedTooltip = null;
      document.body.addEventListener(
        "click",
        this.closeCurrentTooltip.bind(this)
      );
    },

    desactivateHelpMode() {
      this.closeCurrentTooltip();
      this._helpMode = false;
      dojo.removeClass("ebd-body", "help-mode");
      document.body.removeEventListener(
        "click",
        this.closeCurrentTooltip.bind(this)
      );
    },

    closeCurrentTooltip() {
      if (!this._helpMode) return;

      if (this._displayedTooltip == null) return;
      else {
        this._displayedTooltip.close();
        this._displayedTooltip = null;
      }
    },

    /*
     * Custom connect that keep track of all the connections
     *  and wrap clicks to make it work with help mode
     */
    connect(node, action, callback) {
      this._connections.push(dojo.connect($(node), action, callback));
    },

    onClick(node, callback, temporary = true) {
      let safeCallback = (evt) => {
        evt.stopPropagation();
        if (this.isInterfaceLocked()) return false;
        if (this._helpMode) return false;
        callback(evt);
      };

      if (temporary) {
        this.connect($(node), "click", safeCallback);
        dojo.removeClass(node, "unselectable");
        dojo.addClass(node, "selectable");
        this._selectableNodes.push(node);
      } else {
        dojo.connect($(node), "click", safeCallback);
      }
    },

    /**
     * Tooltip to work with help mode
     */
    registerCustomTooltip(html, id = null) {
      id =
        id || this.game_name + "-tooltipable-" + this._customTooltipIdCounter++;
      this._registeredCustomTooltips[id] = html;
      return id;
    },
    attachRegisteredTooltips() {
      Object.keys(this._registeredCustomTooltips).forEach((id) => {
        if (!$(id)) {
          console.error("Trying to attack tooltip on a null element", id);
        } else {
          this.addCustomTooltip(id, this._registeredCustomTooltips[id]);
        }
      });
      this._registeredCustomTooltips = {};
    },
    addCustomTooltip(id, html, delay) {
      if (this.tooltips[id]) {
        this.tooltips[id].label = html;
        return;
      }

      delay = delay || 400;
      let tooltip = new dijit.Tooltip({
        connectId: [id],
        label: html,
        position: this.defaultTooltipPosition,
        showDelay: delay,
      });
      this.tooltips[id] = tooltip;
      dojo.addClass(id, "tooltipable");
      dojo.place(
        `<div id='${id}-help' class='help-marker'>
        <svg xmlns="http://www.w3.org/2000/svg" height="0.8em" viewBox="0 -40 320 600"><path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>
        </div>`,
        id
      );

      dojo.connect($(id), "click", (evt) => {
        if (!this._helpMode) {
          tooltip.close();
        } else {
          evt.stopPropagation();

          if (tooltip.state == "SHOWING") {
            this.closeCurrentTooltip();
          } else {
            this.closeCurrentTooltip();
            tooltip.open($(id));
            this._displayedTooltip = tooltip;
          }
        }
      });

      tooltip.showTimeout = null;
      dojo.connect($(id), "mouseenter", () => {
        if (!this._helpMode && !this._dragndropMode) {
          if (tooltip.showTimeout != null) clearTimeout(tooltip.showTimeout);

          tooltip.showTimeout = setTimeout(() => tooltip.open($(id)), delay);
        }
      });

      dojo.connect($(id), "mouseleave", () => {
        if (!this._helpMode && !this._dragndropMode) {
          tooltip.close();
          if (tooltip.showTimeout != null) clearTimeout(tooltip.showTimeout);
        }
      });
    },

    /*
     * [Undocumented] Called by BGA framework on any notification message
     * Handle cancelling log messages for restart turn
     */
    onPlaceLogOnChannel(msg) {
      var currentLogId = this.notifqueue.next_log_id;
      var res = this.inherited(arguments);
      this._notif_uid_to_log_id[msg.uid] = currentLogId;
      this._last_notif = {
        logId: currentLogId,
        msg,
      };
      return res;
    },

    /*
     * cancelLogs:
     *   strikes all log messages related to the given array of notif ids
     */
    checkLogCancel(notifId) {
      if (
        this.gamedatas.canceledNotifIds != null &&
        this.gamedatas.canceledNotifIds.includes(notifId)
      ) {
        this.cancelLogs([notifId]);
      }
    },

    cancelLogs(notifIds) {
      notifIds.forEach((uid) => {
        if (this._notif_uid_to_log_id.hasOwnProperty(uid)) {
          let logId = this._notif_uid_to_log_id[uid];
          if ($("log_" + logId)) dojo.addClass("log_" + logId, "cancel");
        }
      });
    },

    addLogClass() {
      if (this._last_notif == null) return;
      let notif = this._last_notif;
      if ($("log_" + notif.logId)) {
        let type = notif.msg.type;
        if (type == "history_history") type = notif.msg.args.originalType;

        dojo.addClass("log_" + notif.logId, "notif_" + type);
      }
    },

    /**
     * Own counter implementation that works with replay
     */
    createCounter(id, defaultValue = 0, linked = null) {
      if (!$(id)) {
        console.error("Counter : element does not exist", id);
        return null;
      }

      let game = this;
      let o = {
        span: $(id),
        linked: linked ? $(linked) : null,
        targetValue: 0,
        currentValue: 0,
        speed: 100,
        getValue() {
          return this.targetValue;
        },
        setValue(n) {
          this.currentValue = +n;
          this.targetValue = +n;
          this.span.innerHTML = +n;
          if (this.linked) this.linked.innerHTML = +n;
        },
        toValue(n) {
          if (game.isFastMode()) {
            this.setValue(n);
            return;
          }

          this.targetValue = +n;
          if (this.currentValue != n) {
            this.span.classList.add("counter_in_progress");
            setTimeout(() => this.makeCounterProgress(), this.speed);
          }
        },
        goTo(n, anim) {
          if (anim) this.toValue(n);
          else this.setValue(n);
        },
        incValue(n) {
          let m = +n;
          this.toValue(this.targetValue + m);
        },
        makeCounterProgress() {
          if (this.currentValue == this.targetValue) {
            setTimeout(
              () => this.span.classList.remove("counter_in_progress"),
              this.speed
            );
            return;
          }

          let step = Math.ceil(
            Math.abs(this.targetValue - this.currentValue) / 5
          );
          this.currentValue +=
            (this.currentValue < this.targetValue ? 1 : -1) * step;
          this.span.innerHTML = this.currentValue;
          if (this.linked) this.linked.innerHTML = this.currentValue;
          setTimeout(() => this.makeCounterProgress(), this.speed);
        },
      };
      o.setValue(defaultValue);
      return o;
    },
  });
});
