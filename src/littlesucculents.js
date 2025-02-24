var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Slide of the element from destination to origin.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg) scale(").concat((_e = settings.scale) !== null && _e !== void 0 ? _e : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
/**
 * Slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
/**
 * Just does nothing for the duration
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = /** @class */ (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign({ duration: (_g = (_e = (_d = animation.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : (_f = this.settings) === null || _f === void 0 ? void 0 : _f.duration) !== null && _g !== void 0 ? _g : 500, scale: (_l = (_j = (_h = animation.settings) === null || _h === void 0 ? void 0 : _h.scale) !== null && _j !== void 0 ? _j : (_k = this.zoomManager) === null || _k === void 0 ? void 0 : _k.zoom) !== null && _l !== void 0 ? _l : undefined }, animation.settings);
                        _r = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _r.result = _s.sent();
                        (_o = (_m = animation.settings).animationEnd) === null || _o === void 0 ? void 0 : _o.call(_m, animation);
                        (_p = settings.element) === null || _p === void 0 ? void 0 : _p.classList.remove((_q = settings.animationClass) !== null && _q !== void 0 ? _q : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare * direction;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]);
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * Creates the stock and register it on the manager.
     *
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * Removes the stock and unregister it on the manager.
     */
    CardStock.prototype.remove = function () {
        var _a;
        this.manager.removeStock(this);
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    };
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        var needsCreation = true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
                needsCreation = false;
                if (!updateInformations) {
                    element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
                }
            }
        }
        else if ((_c = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _c === void 0 ? void 0 : _c.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
                needsCreation = false;
            }
        }
        if (needsCreation) {
            var element = this.getCardElement(card);
            if (needsCreation && element) {
                console.warn("Card ".concat(this.manager.getId(card), " already exists, not re-created."));
            }
            // if the card comes from a stock but is not found in this stock, the card is probably hudden (deck with a fake top card)
            var fromBackSide = !(settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) && !(animation === null || animation === void 0 ? void 0 : animation.originalSide) && (animation === null || animation === void 0 ? void 0 : animation.fromStock) && !((_d = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _d === void 0 ? void 0 : _d.contains(card));
            var createdVisible = fromBackSide ? false : (_e = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _e !== void 0 ? _e : this.manager.isCardVisible(card);
            var newElement = element !== null && element !== void 0 ? element : this.manager.createCardElement(card, createdVisible);
            promise = this.moveFromElement(card, newElement, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = fromRect ? this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        }) : Promise.resolve(false);
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                promises.push(new Promise(function (resolve) {
                                    setTimeout(function () { return _this.addCard(cards[i], animation, settings).then(function (result) { return resolve(result); }); }, i * shift);
                                }));
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        var promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);
        return promise;
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = cards.map(function (card) { return _this.removeCard(card, settings); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var cards;
            return __generator(this, function (_a) {
                cards = this.getCards();
                return [2 /*return*/, this.removeCards(cards, settings)];
            });
        });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unselect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    /**
     * Changes the sort function of the stock.
     *
     * @param sort the new sort function. If defined, the stock will be sorted with this new function.
     */
    CardStock.prototype.setSort = function (sort) {
        this.sort = sort;
        if (this.sort && this.cards.length) {
            this.cards.sort(this.sort);
            var previouslyMovedCardDiv = this.getCardElement(this.cards[this.cards.length - 1]);
            this.element.appendChild(previouslyMovedCardDiv);
            for (var i = this.cards.length - 2; i >= 0; i--) {
                var movedCardDiv = this.getCardElement(this.cards[i]);
                this.element.insertBefore(movedCardDiv, previouslyMovedCardDiv);
                previouslyMovedCardDiv = movedCardDiv;
            }
        }
    };
    return CardStock;
}());
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.fakeCardGenerator = (_a = settings === null || settings === void 0 ? void 0 : settings.fakeCardGenerator) !== null && _a !== void 0 ? _a : manager.getFakeCardGenerator();
        _this.thicknesses = (_b = settings.thicknesses) !== null && _b !== void 0 ? _b : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_c = settings.cardNumber) !== null && _c !== void 0 ? _c : 0);
        _this.autoUpdateCardNumber = (_d = settings.autoUpdateCardNumber) !== null && _d !== void 0 ? _d : true;
        _this.autoRemovePreviousCards = (_e = settings.autoRemovePreviousCards) !== null && _e !== void 0 ? _e : true;
        var shadowDirection = (_f = settings.shadowDirection) !== null && _f !== void 0 ? _f : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard);
        }
        else if (settings.cardNumber > 0) {
            _this.addCard(_this.getFakeCard());
        }
        if (settings.counter && ((_g = settings.counter.show) !== null && _g !== void 0 ? _g : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                console.warn("Deck card counter created without a cardNumber");
            }
            _this.createCounter((_h = settings.counter.position) !== null && _h !== void 0 ? _h : 'bottom', (_j = settings.counter.extraClasses) !== null && _j !== void 0 ? _j : 'round', settings.counter.counterId);
            if ((_k = settings.counter) === null || _k === void 0 ? void 0 : _k.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
            }
        }
        _this.setCardNumber((_l = settings.cardNumber) !== null && _l !== void 0 ? _l : 0);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     * @param topCard the deck top card. If unset, will generated a fake card (default). Set it to null to not generate a new topCard.
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = undefined; }
        var promise = Promise.resolve(false);
        var oldTopCard = this.getTopCard();
        if (topCard !== null && cardNumber > 0) {
            var newTopCard = topCard || this.getFakeCard();
            if (!oldTopCard || this.manager.getId(newTopCard) != this.manager.getId(oldTopCard)) {
                promise = this.addCard(newTopCard, undefined, { autoUpdateCardNumber: false });
            }
        }
        else if (cardNumber == 0 && oldTopCard) {
            promise = this.removeCard(oldTopCard, { autoUpdateCardNumber: false });
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
        return promise;
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1, null);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.removeAll = function (settings) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            return __generator(this, function (_c) {
                promise = _super.prototype.removeAll.call(this, __assign(__assign({}, settings), { autoUpdateCardNumber: (_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : false }));
                if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _b !== void 0 ? _b : true) {
                    this.setCardNumber(0, null);
                }
                return [2 /*return*/, promise];
            });
        });
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function (settings) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var animatedCardsMax, animatedCards, elements, getFakeCard, uid, i, newCard, newElement, pauseDelayAfterAnimation;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        animatedCardsMax = (_a = settings === null || settings === void 0 ? void 0 : settings.animatedCardsMax) !== null && _a !== void 0 ? _a : 10;
                        this.addCard((_b = settings === null || settings === void 0 ? void 0 : settings.newTopCard) !== null && _b !== void 0 ? _b : this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 4];
                        elements = [this.getCardElement(this.getTopCard())];
                        getFakeCard = function (uid) {
                            var newCard;
                            if (settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter) {
                                newCard = {};
                                settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter(newCard, uid);
                            }
                            else {
                                newCard = _this.fakeCardGenerator("".concat(_this.element.id, "-shuffle-").concat(uid));
                            }
                            return newCard;
                        };
                        uid = 0;
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = void 0;
                            do {
                                newCard = getFakeCard(uid++);
                            } while (this.manager.getCardElement(newCard)); // To make sure there isn't a fake card remaining with the same uid
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _d.sent();
                        pauseDelayAfterAnimation = (_c = settings === null || settings === void 0 ? void 0 : settings.pauseDelayAfterAnimation) !== null && _c !== void 0 ? _c : 500;
                        if (!(pauseDelayAfterAnimation > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.manager.animationManager.play(new BgaPauseAnimation({ duration: pauseDelayAfterAnimation }))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2 /*return*/, true];
                    case 4: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    Deck.prototype.getFakeCard = function () {
        return this.fakeCardGenerator(this.element.id);
    };
    return Deck;
}(CardStock));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck', (_a = settings.direction) !== null && _a !== void 0 ? _a : 'vertical');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        element.style.setProperty('--vertical-shift', (_c = (_b = settings.verticalShift) !== null && _b !== void 0 ? _b : settings.shift) !== null && _c !== void 0 ? _c : '3px');
        element.style.setProperty('--horizontal-shift', (_e = (_d = settings.horizontalShift) !== null && _d !== void 0 ? _d : settings.shift) !== null && _e !== void 0 ? _e : '3px');
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
            if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                _this.element.dataset.empty = 'true';
            }
        }
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.cardNumberUpdated();
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.cardNumberUpdated();
    };
    AllVisibleDeck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\">0</div>\n        "));
    };
    /**
     * Updates the cards number, if the counter is visible.
     */
    AllVisibleDeck.prototype.cardNumberUpdated = function () {
        var cardNumber = this.cards.length;
        this.element.style.setProperty('--tile-count', '' + cardNumber);
        this.element.dataset.empty = (cardNumber == 0).toString();
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    return AllVisibleDeck;
}(CardStock));
var HandStock = /** @class */ (function (_super) {
    __extends(HandStock, _super);
    function HandStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('hand-stock');
        element.style.setProperty('--card-overlap', (_a = settings.cardOverlap) !== null && _a !== void 0 ? _a : '60px');
        element.style.setProperty('--card-shift', (_b = settings.cardShift) !== null && _b !== void 0 ? _b : '15px');
        element.style.setProperty('--card-inclination', "".concat((_c = settings.inclination) !== null && _c !== void 0 ? _c : 12, "deg"));
        _this.inclination = (_d = settings.inclination) !== null && _d !== void 0 ? _d : 4;
        return _this;
    }
    HandStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateAngles();
        return promise;
    };
    HandStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateAngles();
    };
    HandStock.prototype.updateAngles = function () {
        var _this = this;
        var middle = (this.cards.length - 1) / 2;
        this.cards.forEach(function (card, index) {
            var middleIndex = index - middle;
            var cardElement = _this.getCardElement(card);
            cardElement.style.setProperty('--hand-stock-middle-index', "".concat(middleIndex));
            cardElement.style.setProperty('--hand-stock-middle-index-abs', "".concat(Math.abs(middleIndex)));
        });
    };
    return HandStock;
}(CardStock));
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
/**
 * A stock with manually placed cards
 */
var ManualPositionStock = /** @class */ (function (_super) {
    __extends(ManualPositionStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
}(CardStock));
/**
 * A stock with button to scroll left/right if content is bigger than available width
 */
var ScrollableStock = /** @class */ (function (_super) {
    __extends(ScrollableStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function ScrollableStock(manager, elementWrapper, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        _this = _super.call(this, manager, elementWrapper, settings) || this;
        _this.manager = manager;
        elementWrapper.classList.add('scrollable-stock');
        elementWrapper.dataset.center = ((_a = settings.center) !== null && _a !== void 0 ? _a : true).toString();
        elementWrapper.style.setProperty('--button-gap', (_b = settings.buttonGap) !== null && _b !== void 0 ? _b : '0');
        elementWrapper.style.setProperty('--gap', (_c = settings.gap) !== null && _c !== void 0 ? _c : '8px');
        _this.scrollStep = (_d = settings.scrollStep) !== null && _d !== void 0 ? _d : 100;
        elementWrapper.dataset.scrollbarVisible = ((_e = settings.scrollbarVisible) !== null && _e !== void 0 ? _e : true).toString();
        elementWrapper.appendChild(_this.createButton('left', settings.leftButton));
        _this.element = document.createElement('div');
        _this.element.classList.add('scrollable-stock-inner');
        elementWrapper.appendChild(_this.element);
        elementWrapper.appendChild(_this.createButton('right', settings.rightButton));
        return _this;
    }
    ScrollableStock.prototype.createButton = function (side, settings) {
        var _a;
        var _this = this;
        var _b;
        var button = document.createElement('button');
        button.type = 'button';
        (_a = button.classList).add.apply(_a, __spreadArray([side], ((_b = settings.classes) !== null && _b !== void 0 ? _b : []), false));
        if (settings.html) {
            button.innerHTML = settings.html;
        }
        button.addEventListener('click', function () { return _this.scroll(side); });
        return button;
    };
    ScrollableStock.prototype.scroll = function (side) {
        this.element.scrollBy({
            left: this.scrollStep * (side === 'left' ? -1 : 1),
            behavior: 'smooth'
        });
    };
    return ScrollableStock;
}(CardStock));
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     *
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    SlotStock.prototype.addSlotsIds = function (newSlotsIds) {
        var _a;
        var _this = this;
        if (newSlotsIds.length == 0) {
            // no change
            return;
        }
        (_a = this.slotsIds).push.apply(_a, newSlotsIds);
        newSlotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var closestSlot = this.getCardElement(card).closest('.slot');
            if (closestSlot) {
                var currentCardSlot = closestSlot.dataset.slotId;
                var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
                return currentCardSlot != slotId;
            }
            else {
                return true;
            }
        }
    };
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) { // after splice/push
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotStock;
}(LineStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function () {
                return _this.removeCard(card);
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateMainTimeoutId = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    CardManager.prototype.removeStock = function (stock) {
        var index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return Promise.resolve(false);
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            var updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.animationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardManager.prototype.getFakeCardGenerator = function () {
        var _this = this;
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.fakeCardGenerator) !== null && _b !== void 0 ? _b : (function (deckId) { return ({ id: _this.getId({ id: "".concat(deckId, "-fake-top-card") }) }); });
    };
    return CardManager;
}());
var Generics = /** @class */ (function () {
    function Generics() {
    }
    Generics.addIdDiv = function (card, element) {
        var div = document.createElement("div");
        div.classList.add("id_number");
        if (card.id)
            div.innerText = card.id.toString();
        if (element.querySelector(".id_number")) {
            element.replaceChild(div, element.querySelector(".id_number"));
        }
        else {
            element.append(div);
        }
    };
    Generics.addTextDiv = function (text, classe, element) {
        var div = document.createElement("div");
        div.classList.add(classe);
        var innerDiv = document.createElement("div");
        innerDiv.innerHTML = text;
        div.append(innerDiv);
        if (element.querySelector("." + classe))
            element.replaceChild(div, element.querySelector("." + classe));
        else
            element.append(div);
    };
    Generics.getCardContainer = function (card) {
        switch (card.location) {
            case "player":
                return card.playerId;
            case "plantboard":
            case "potboard":
                return "board";
            case "waterCan":
                return "waterCan-" + card.playerId;
            default:
                return card.location;
        }
    };
    return Generics;
}());
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock",
    g_gamethemeurl + "modules/js/Core/game.js",
    g_gamethemeurl + "modules/js/Core/modal.js",
    g_gamethemeurl + "modules/js/Utils/cheatModule.js",
    g_gamethemeurl + "modules/js/zoomUI.js",
], function (dojo, declare) {
    return declare("bgagame.littlesucculents", [customgame.game, littlesucculents.cheatModule, littlesucculents.zoomUI], new LittleSucculentsGame());
});
var TurnCounter = /** @class */ (function () {
    function TurnCounter(value, prefix, suffix) {
        if (prefix === void 0) { prefix = ""; }
        if (suffix === void 0) { suffix = ""; }
        this.value = value;
        this.prefix = prefix;
        this.suffix = suffix;
        dojo.place("<div id='LSU_turnCounter'>".concat(this.getFullString(), "</div>"), "synchronous_notif_icon", "before");
    }
    TurnCounter.prototype.toValue = function (newValue) {
        this.value = newValue;
        $("LSU_turnCounter").innerText = this.getFullString();
    };
    TurnCounter.prototype.getFullString = function () {
        return this.prefix + this.value + this.suffix;
    };
    return TurnCounter;
}());
var Players = /** @class */ (function () {
    function Players(gameui) {
        this.gameui = gameui;
    }
    Players.prototype.updatePlayer = function (player) {
        if (player.isFirst) {
            this.gameui.attachElementWithSlide($("firstPlayer"), $("first-player-".concat(player.id)));
        }
        this.gameui._counters["water-" + player.id].toValue(player.water);
        if (player.money) {
            this.gameui._counters["money-" + player.id].toValue(player.money);
        }
        this.gameui.scoreCtrl[player.id].toValue(player.score);
    };
    Players.prototype.setupPlayers = function (gamedatas) {
        for (var playerId in gamedatas.players) {
            var player = gamedatas.players[playerId];
            this.gameui.place("tplPlayerPanel", player, "overall_player_board_" + playerId);
            this.gameui._counters["water-" + playerId] = this.gameui.createCounter("water-" + playerId, player.water);
            this.gameui._counters["money-" + playerId] = this.gameui.createCounter("money-" + playerId, player.money);
            this.gameui.place("board_tpl", player, "table");
        }
        this.myUpdatePlayerOrdering("gamezone", "table");
    };
    /**
     * Update player Panel (firstPlayer token, scores...)
     * @param players
     */
    Players.prototype.updatePlayers = function (players) {
        for (var playerId in players) {
            var player = players[playerId];
            this.updatePlayer(player);
        }
    };
    //place each player board in good order.
    Players.prototype.myUpdatePlayerOrdering = function (elementName, container) {
        for (var i in this.gameui.gamedatas.playerorder) {
            var playerId = this.gameui.gamedatas.playerorder[i];
            if (!$(elementName + "-" + playerId)) {
                debug("error with " + elementName + "-" + playerId);
            }
            else {
                dojo.place(elementName + "-" + playerId, container, "last");
            }
        }
    };
    Players.prototype.getPlayers = function () {
        return Object.values(this.gameui.gamedatas.players);
    };
    Players.prototype.getColoredName = function (pId) {
        var name = this.gameui.gamedatas.players[pId].name;
        return this.gameui.coloredPlayerName(name);
    };
    Players.prototype.getPlayerColor = function (pId) {
        return this.gameui.gamedatas.players[pId].color;
    };
    Players.prototype.isSolo = function () {
        return this.getPlayers().length == 1;
    };
    return Players;
}());
var Token = /** @class */ (function () {
    function Token(gameui) {
        this.gameui = gameui;
    }
    Token.countTokens = function (elem) {
        return elem.querySelectorAll(".token:not(.flower)").length;
    };
    Token.takeToken = function (elem) {
        return elem.querySelector(".token:not(.flower)");
    };
    Token.prototype.moveTokenOnCard = function (token, card) {
        if (!token) {
            debug("Problem in moveTokenOnCard", token, card);
            return;
        }
        //add statics if needed
        if (card.type === undefined)
            this.gameui.addStatics(card);
        var cardElement = this.gameui._cardManager.getCardElement(card);
        var _a = this.getAvailablePlaces(card, cardElement), busyPlaces = _a[0], availablePlaces = _a[1];
        //change token place if busy
        if (busyPlaces.includes(+token.dataset.placeId)) {
            debug("I change token placeId");
            token.dataset.placeId = availablePlaces[0].toString();
        }
        this.gameui.attachElementWithSlide(token, cardElement);
    };
    Token.prototype.adjustTokens = function (card, from) {
        // debug("adjust Token", card);
        var _this = this;
        var _a;
        if (from === void 0) { from = null; }
        var element = this.gameui._cardManager.getCardElement(card);
        if (!element)
            return; //for fake case no need
        //flower
        if (card.flowered) {
            var flowerElem_1 = this.gameui.getFlowerElem(card.flowered);
            // debug("bug", flowerElem, element);
            //wait added to make it running, don't know why
            this.gameui
                .wait(2)
                .then(function () { return _this.gameui.attachElementWithSlide(flowerElem_1, element); });
        }
        var _b = this.getAvailablePlaces(card, element), busyPlaces = _b[0], availablePlaces = _b[1];
        var tokensOnCard = Math.max(0, (_a = card.tokenNb) !== null && _a !== void 0 ? _a : 0);
        if (busyPlaces.length < tokensOnCard) {
            // debug(
            //   `There are ${
            //     busyPlaces.length
            //   } tokens on this element, it should have ${tokensOnCard}, i add ${
            //     card.tokenNb - busyPlaces.length
            //   } elems`
            // );
            this.addTokens(card.tokenNb - busyPlaces.length, card, availablePlaces, from);
        }
        else if (busyPlaces.length > tokensOnCard) {
            // debug(
            //   `There are ${
            //     busyPlaces.length
            //   } tokens on this element, it should have ${tokensOnCard}, i remove ${
            //     busyPlaces.length - card.tokenNb
            //   } elems`
            // );
            this.removeTokens(Math.abs(tokensOnCard - busyPlaces.length), element);
        }
    };
    Token.prototype.addTokens = function (nb, card, availablePlaces, container) {
        // debug("addTokens", nb, card, availablePlaces);
        for (var index = 0; index < nb; index++) {
            if (container) {
                var token = this.createToken(container, availablePlaces[index]);
                this.moveTokenOnCard(token, card);
            }
            else {
                var token = this.createToken(this.gameui._cardManager.getCardElement(card), availablePlaces[index]);
                token.dataset.placeId = availablePlaces[index].toString();
            }
        }
    };
    Token.prototype.removeTokens = function (nb, elem) {
        debug("removeTOkens", nb, elem);
        var tokens = elem.querySelectorAll(".token");
        // debug("j'ai trouvé ces tokens :", tokens);
        for (var index = 0; index < nb; index++) {
            var element = tokens[index];
            gameui.slideToObjectAndDestroy(element, "pagemaintitletext");
        }
    };
    Token.prototype.createToken = function (initialContainer, placeId) {
        var result = document.createElement("div");
        result.id = "token-" + Token.idGen++;
        result.classList.add("token");
        var sides = document.createElement("div");
        sides.classList.add("sides");
        var rotate = Math.random() * 60 - 30;
        // sides.style.transform = `rotate(${rotate}deg)`;
        ["front", "back"].forEach(function (side) {
            var sideElem = document.createElement("div");
            sideElem.classList.add(side);
            sideElem.classList.add("side");
            sides.append(sideElem);
        });
        result.append(sides);
        result.dataset.placeId = placeId.toString();
        initialContainer.append(result);
        return result;
    };
    Token.prototype.getAvailablePlaces = function (card, cardElement) {
        var _a;
        if (card.tokenNb < 0) {
            debug("ERROR with tokenNb", card);
            return;
        }
        var places = Array.from(new Array(((_a = card.tokenNb) !== null && _a !== void 0 ? _a : 0) + 4), function (x, i) { return i + 1; });
        var busyPlaces = Array.from(cardElement.querySelectorAll(".token:not(.flower)")).map(function (elem) { return +elem.dataset.placeId; });
        var getShuffledArr = function (arr) {
            var _a;
            var newArr = arr.slice();
            for (var i = newArr.length - 1; i > 0; i--) {
                var rand = Math.floor(Math.random() * (i + 1));
                _a = [newArr[rand], newArr[i]], newArr[i] = _a[0], newArr[rand] = _a[1];
            }
            return newArr;
        };
        // debug("busyPlaces", cardElement, busyPlaces);
        return [
            busyPlaces,
            getShuffledArr(places.filter(function (x) { return !busyPlaces.includes(x); })),
        ];
    };
    Token.idGen = 0;
    return Token;
}());
var CardSetting = /** @class */ (function () {
    function CardSetting(animationManager) {
        this.animationManager = animationManager;
        this.cardHeight = 88;
        this.cardWidth = 63;
    }
    CardSetting.getElementId = function (card) {
        return card.type + "_" + card.id;
    };
    CardSetting.prototype.getId = function (card) {
        return CardSetting.getElementId(card);
    };
    CardSetting.prototype.setupDiv = function (card, element) {
        element.classList.add(card.type);
        if (card.deck == "starter" && card.type == "pot") {
            element.classList.add("basicPot", card.state > 0 ? "right" : "left");
        }
    };
    CardSetting.prototype.setupFrontDiv = function (card, element) {
        if (card.dataId)
            element.dataset.dataId = card.dataId.toString();
        if (card.type == "plant") {
            Generics.addTextDiv(this.animationManager.game.insertIcons(card.hint), "text", element);
            Generics.addTextDiv(_(card.name), "title", element);
        }
        else if (card.type == "pot") {
            Generics.addTextDiv(card.maxLeaf.toString(), "size", element);
        }
        Generics.addIdDiv(card, element);
        //generate Tokens
        this.animationManager.game._tokenManager.adjustTokens(card);
    };
    return CardSetting;
}());
var MyCardManager = /** @class */ (function (_super) {
    __extends(MyCardManager, _super);
    function MyCardManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyCardManager.prototype.updateAllToolTips = function () {
        var _this = this;
        this.game.forEachPlayer(function (player) {
            debug("update du stock de ", player.id);
            _this.game._stocks[player.id]
                .getCards()
                .forEach(function (card) { return _this.addTooltip(card); });
        });
    };
    MyCardManager.prototype.updateCardInformations = function (card, settings) {
        if (card.type === undefined)
            this.game.addStatics(card);
        _super.prototype.updateCardInformations.call(this, card, settings);
        var newPlace = this.game._stocks[Generics.getCardContainer(card)];
        // debug("updateCardInformations", newPlace, card);
        if (newPlace && (!newPlace.contains(card) || newPlace instanceof SlotStock))
            newPlace.addCard(card);
        this.addTooltip(card);
    };
    MyCardManager.prototype.addTooltip = function (card) {
        this.game.addCustomTooltip(CardSetting.getElementId(card) + "-front", this.tooltip_tpl(card));
    };
    MyCardManager.prototype.tooltip_tpl = function (card) {
        var baseElem = this.getCardElement(card).cloneNode(true);
        baseElem.id = "";
        baseElem
            .querySelectorAll(".token, .help-marker")
            .forEach(function (elem) { return elem.remove(); });
        return baseElem.outerHTML + this.createHelpText(card);
    };
    MyCardManager.prototype.createHelpText = function (card) {
        var _a, _b, _c, _d, _e;
        var noExplanationPlants = [
            "RainbowWest",
            "StringofPearls",
            "StringofDolphins",
            "CoralCactus",
            "BabySunRose",
            "LivingStone",
            "Pot",
        ];
        var html = '<div class="id-card">';
        //name
        html += "<div class=\"name\">".concat(_(card.name), "</div>");
        //score details
        var scoreDetail = (_b = (_a = this.game.gamedatas.players[card.playerId]) === null || _a === void 0 ? void 0 : _a.scoreDetails) === null || _b === void 0 ? void 0 : _b[card.id];
        // if (card.id == 10) debug("scoreDetail", scoreDetail);
        if (scoreDetail) {
            if (card.class == "MoneyPlant") {
                html += "<div class=\"total-money\">".concat(card.tokenNb, "</div>");
                html += "<p class='score-details'>";
                html += "<p class=\"explanations\">".concat(this.getExplanation(card, scoreDetail[3]), "</p>");
                html += "</p>";
            }
            else {
                html += "<div class=\"total-score\">".concat(scoreDetail[0] + scoreDetail[1] + scoreDetail[2], "</div>");
                html += "<p class='score-details'>";
                if (scoreDetail[0]) {
                    html += "".concat(_("Score for flower :"), " ").concat(scoreDetail[0], "<br>");
                }
                if (card.type != POT) {
                    html += "".concat(_("Leaves on this succulent :"), " ").concat(scoreDetail[1], "<br>");
                }
                else {
                    html += _("Each pot scores 2 points");
                }
                if (!noExplanationPlants.includes(card.class)) {
                    html += "".concat(_("Special scoring :"), " ").concat(scoreDetail[2], "<br>");
                    //explanations
                    if (card.class)
                        html += "<p class=\"explanations\">".concat(this.getExplanation(card, scoreDetail[3]), "</p>");
                }
                html += "</p>";
            }
        }
        //rule
        html += "<p class=\"fake-component\"></p>";
        html += "<p class=\"rules\">".concat(this.getRules(card.class), "</p>");
        if (card.type == POT) {
            // for pot
            html += "<p>".concat(this.game.fsr(_("Water to grow : ${value}"), {
                value: (_c = card.maxWater) !== null && _c !== void 0 ? _c : "",
            }), "</p>");
            html += "<p>".concat(this.game.fsr(_("Max succulent size : ${value} leaves"), {
                value: (_d = card.maxLeaf) !== null && _d !== void 0 ? _d : "",
            }), "</p>");
        }
        html += "<p class=\"color\">".concat(this.game.fsr("Color : ${color}", {
            color: (_e = card.color) !== null && _e !== void 0 ? _e : "",
            i18n: ["color"],
        }), "</p>");
        html += "</div>";
        return html;
    };
    MyCardManager.prototype.getRules = function (classe) {
        switch (classe) {
            case "BabyToes":
                return _("If you have the same number of succulents on each side of your moneyplant, each copy of Baby Toes is worth 5 points.");
            case "SnakePlant":
                return _("If this succulent has grown to it’s pots leaf capacity it’s considered ‘full’ and can’t grow anymore - it scores an additional 5 points. This applies to all pots.");
            case "MexicanFirecracker":
                return _("If you have the most or equal most number of Mexican Firecracker plants, each is worth 5 points. Otherwise each is worth 2.");
            case "StringofPearls":
                return _("This succulent can grow 6 more leaves than the maximum size of the pot. There are no additional bonus points.");
            case "StringofDolphins":
                return _("Each time you convert water into leaves, add 2 leaves to the String of Dolphins.");
            case "JellybeanPlant":
                return _("Count each of colour in your display (excluding gray and rainbow) and score 1 point for each per Jellybean plant you have. Consider both pot and plant cards.");
            case "CalicoHearts":
                return _("Count the number of succulents between this Calico Hearts and the Money Plant. Score 1 points for each.");
            case "BunnyEars":
                return _("If the number of leaves on this Bunny Ears is odd, score -1 point. If it is even, score +4 points.");
            case "RibbonPlant":
                return _("Count the number of Ribbon Plants in all displays. The score for each is 1 times that number.");
            case "BabySunRose":
                return _("Every turn, during the growth phase, move one leaf from another succulent onto this Baby Sun Rose. You may do this before or after placing water or leaves. If this Baby Sun Rose has reached it’s pot limit, do not move any leaves.");
            case "CoralCactus":
                return _("This Coral Cactus gains an extra water droplet every grow phase.");
            case "LivingStone":
                return _("Score 3 points for each living stone you have");
            case "RainbowWest":
                return _("The Rainbow West can flower any flower once per game. The colour of the pot needs to match the desired flower.");
            case "AloeVera":
                return _("Each water in the watering can at the end of the game is worth 1 point.");
            case "MoonCactus":
                return _("At the end of the game, if you have no flowers in your display, score 7 points.");
            case "LeafWindow":
                return _("If your Money Plant is at max capacity you score 7 points. The leaves on the Money Plant still score 0.");
            case "MermaidTail":
                return _("If you have the most or equal most succulents, score 7 points.");
            case "PetRock":
                return _("The pet rock never scores from it’s leaves - it scores 5 points at the end of the game.");
            case "MoneyPlant":
                return _("Leaves on this Money Plant can be used at the market to buy new cards. The leaves of the Money Plant score 0 points.");
            case "Water":
                return "";
            case "Pot":
                return _("");
        }
    };
    MyCardManager.prototype.getExplanation = function (card, explanations) {
        var _this = this;
        var args = {};
        //prepare args
        for (var index = 0; index < explanations.length; index++) {
            args["item" + index] = explanations[index];
        }
        var log = "";
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
                Object.entries(explanations).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    log += "".concat(_this.game._playerManager.getColoredName(+key), " : ").concat(value, "<br>");
                });
                return log;
            case "JellybeanPlant":
                //TODO make it translatable
                var stringToTranslate = "(" +
                    Object.keys(args)
                        .map(function (e) { return "${" + e + "}"; })
                        .join(", ") +
                    ")";
                args["i18n"] = Object.keys(args);
                return (this.game.fsr(_("Each color score 1 ${point}"), { point: "point" }) +
                    this.game.fsr(stringToTranslate, args));
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
                        : _("${player_name} has ${item0} flowers(s) in his display, no bonus.")
                    : this.game.isItMe(card.playerId)
                        ? _("${you} have ${item0} flower in your display => 7 ${points}")
                        : _("${player_name} has ${item0} flower in your display => 7 ${points}");
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
        args["player_name"] = this.game._playerManager.getColoredName(card.playerId);
        args["you"] = this.game.coloredYou();
        args["points"] = _("points");
        args["point"] = _("point");
        if (args["i18n"]) {
            args["i18n"].push("point");
            args["i18n"].push("points");
        }
        else {
            args["i18n"] = ["points", "point"];
        }
        if (args && !log)
            debug("What can I do with ", args, card.class);
        return this.game.fsr(log, args);
    };
    MyCardManager.prototype.isElementFlipped = function (card) {
        return this.getCardElement(card).dataset.side == "back";
    };
    return MyCardManager;
}(CardManager));
var SlotStockForSucculents = /** @class */ (function (_super) {
    __extends(SlotStockForSucculents, _super);
    function SlotStockForSucculents(manager, element, settings) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.game = manager.game;
        return _this;
    }
    SlotStockForSucculents.prototype.addCard = function (card, animation, settings) {
        this.game.addStatics(card);
        return _super.prototype.addCard.call(this, card, animation, settings);
    };
    SlotStockForSucculents.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].id = slotId;
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(["slot"], this.slotClasses, true));
    };
    return SlotStockForSucculents;
}(SlotStock));
var littlesucculents_f = function (data) {
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
var POT = "pot";
var PLANT = "plant";
var WATER = "water";
var YELLOW = "yellow";
var GREEN = "green";
var BLUE = "blue";
var GREY = "grey";
var RED = "red";
var PINK = "pink";
var ORANGE = "orange";
var DECK_PLANT = "deckplant";
var DECK_POT = "deckpot";
var RAINBOW = "rainbow";
var SET_A = "setA";
var SET_B = "setB";
var STARTER = "starter";
// prettier-ignore
var CARDS_DATA = {
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
    39: littlesucculents_f([POT, 4, 2, 4, GREY, STARTER + POT, 'Pot', 'Pot', '']),
    40: littlesucculents_f([PLANT, 0, 0, 4, GREY, STARTER + PLANT, 'MoneyPlant', 'Money Plant', '<leaf> are <money><br>but worth 0<vp>']),
    41: littlesucculents_f([WATER, 0, 1, 3, GREY, WATER, 'Water', 'Water', '']),
    42: littlesucculents_f([WATER, 0, 2, 3, GREY, WATER, 'Water', 'Water', '']),
    43: littlesucculents_f([WATER, 0, 3, 3, GREY, WATER, 'Water', 'Water', '']),
    44: littlesucculents_f([WATER, 0, 4, 3, GREY, WATER, 'Water', 'Water', '']),
};
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
    function GameGui() { }
    return GameGui;
})();
var isDebug = window.location.host == "studio.boardgamearena.com" ||
    window.location.hash.indexOf("debug") > -1;
var debug = isDebug ? console.info.bind(window.console) : function () { };
var LittleSucculentsGame = /** @class */ (function (_super) {
    __extends(LittleSucculentsGame, _super);
    function LittleSucculentsGame() {
        var _this = _super.call(this) || this;
        _this._nonActiveStates = ["water"];
        _this._notifications = [
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
        _this.default_viewport = "width=800";
        _this._counters = {};
        _this._stocks = {};
        _this.waterCards = {};
        _this._animationManager = new AnimationManager(_this);
        var cardGameSetting = new CardSetting(_this._animationManager);
        _this._cardManager = new MyCardManager(_this, cardGameSetting);
        return _this;
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
    LittleSucculentsGame.prototype.setup = function (gamedatas) {
        debug("setup", gamedatas);
        this.gamedatas = gamedatas;
        this._tokenManager = new Token(this);
        this._playerManager = new Players(this);
        // Setting up player boards
        this._playerManager.setupPlayers(gamedatas);
        this.setupCards(gamedatas);
        //add waterCan
        this.updateWaterCans(gamedatas.players);
        $("ebd-body").classList.toggle("two-players", Object.keys(gamedatas.players).length == 2);
        //create zoom panel and define Utils
        this.setupZoomUI();
        // add shortcut and navigation
        //add cheat block if cheatModule is active
        if (gamedatas.cheatModule) {
            this.cheatModuleSetup(gamedatas);
        }
        this.adaptWidth();
        this.inherited(arguments);
        // Create a new div for tokens before buttons in maintitlebar
        dojo.place("<div id='token-container'></div>", $("generalactions"), "before");
        dojo.place("<div id='droplets'></div>", $("token-container"));
        dojo.place("<div id='dropletsFromCan'></div>", $("token-container"));
        this._turnCounter = new TurnCounter(gamedatas.turn, _("Season: "), "/12");
        if (gamedatas.turn == 12)
            this.displayCaution();
        if (isDebug) {
            $("ebd-body").classList.add("debug");
        }
        //add general tooltips
        this.addTooltips();
        debug("Ending game setup");
    };
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
    LittleSucculentsGame.prototype.onEnteringStateConfirm = function (args) {
        var _this = this;
        this.addUndoButton();
        this.addDangerActionButton("btn-confirm", _("Confirm"), function () {
            _this.takeAction({ actionName: "actConfirm" });
        });
        this.startActionTimer("btn-confirm", 8, this.getGameUserPreference(201));
    };
    LittleSucculentsGame.prototype.onEnteringStateMove = function (args) {
        var _this = this;
        this._stocks[this.player_id].setSelectionMode("single");
        this._stocks[this.player_id].setSelectableCards(args.plants
            //exclude already moved cards
            .filter(function (c) {
            return !args.moves || !Object.keys(args.moves).includes(c.id.toString());
        })
            .map(function (c) { return _this.addStatics(c); }));
        this._stocks[this.player_id].onSelectionChange = function (selection, lastChange) {
            if (selection.includes(lastChange)) {
                _this.clientState("clientChooseDestination", _("Choose where to move this plant"), {
                    stateArgs: args,
                    card: lastChange,
                });
            }
        };
        this.addActionButton("btn-pass", _("I don't need"), function () {
            _this.takeAction({
                actionName: "actPass",
            });
        });
        this.addUndoButton();
    };
    LittleSucculentsGame.prototype.onEnteringStatePlay = function (args) {
        var _this = this;
        //buy action
        if (Object.values(args.buyableCards).length > 0) {
            this.addActionButton("btn-buy", _("Buy a card"), function () {
                _this.clientState("clientBuy", _("${you} can choose a card from market"), {
                    buyableCards: args.buyableCards,
                    possiblePlaces: args.possiblePlaces,
                });
            });
        }
        //cut action
        if (Object.values(args.cuttableCards).length > 0) {
            this.addActionButton("btn-cut", _("Cut a plant"), function () {
                _this.clientState("clientCut", _("${you} can choose a plant to cut from an opponent display"), {
                    cuttableCards: args.cuttableCards,
                    possiblePlantPlaces: args.possiblePlaces[PLANT],
                });
            });
        }
        //flower action
        if (Object.values(args.flowerableCards.possibleColors).length > 0) {
            this.addActionButton("btn-flower", _("Flower a plant"), function () {
                _this.clientState("clientFlower", _("${you} can choose a plant to flower"), args.flowerableCards);
            });
        }
        //tend action
        this.addActionButton("btn-tend", _("Tend"), function () {
            _this.takeAction({ actionName: "actChooseTend" });
        });
    };
    LittleSucculentsGame.prototype.onEnteringStateTend = function (args) {
        var _this = this;
        var translatableStrings = {
            move: _("Move"),
            water: _("Water"),
        };
        args.possibleTendActions.forEach(function (action) {
            _this.addActionButton("btn-" + action, translatableStrings[action], function () {
                return _this.takeAction({
                    actionName: "actChooseAction",
                    action: action,
                });
            });
        });
        this.addUndoButton();
    };
    LittleSucculentsGame.prototype.onUpdateActivityWater = function (args) {
        debug("update water", args);
        this.addResetButton();
    };
    LittleSucculentsGame.prototype.onLeavingStateWater = function (args) {
        debug("leaving water", args);
        if (!this.isSpectator)
            $("watercan-" + this.player_id).replaceChildren();
    };
    LittleSucculentsGame.prototype.onLeavingStateWaterSolo = function (args) {
        this.onLeavingStateWater(args);
    };
    LittleSucculentsGame.prototype.onEnteringStateWaterSolo = function (args) {
        this.onEnteringStateWater(args);
        this.addUndoButton();
    };
    LittleSucculentsGame.prototype.onEnteringStateWater = function (args) {
        var _this = this;
        if (this.isSpectator)
            return;
        this.possiblePlaces = args.possiblePlaces[this.player_id];
        var remainingSpace = 0;
        //add possible click on all possiblePlaces
        Object.entries(args.possiblePlaces[this.player_id]).forEach(function (_a) {
            var cardId = _a[0], spaceNb = _a[1];
            if (+spaceNb > 0) {
                _this.onClick("pot_" + cardId + "-front", function () {
                    _this.planMoveToken(+cardId);
                    if (!_this.areDropletsRemaining()) {
                        $("btn-water").innerText = _("Confirm");
                    }
                });
                remainingSpace += spaceNb;
            }
            else {
                $("pot_" + cardId + "-front").classList.add("unselectable");
            }
        });
        //exception for watercan
        this.onClick("waterCan-" + this.player_id, function () {
            _this.storeWaterToken();
            if (!_this.areDropletsRemaining()) {
                $("btn-water").innerText = _("Confirm");
            }
        });
        var remainingDroplets = Math.min(args.water[this.player_id] + args.waterFromCan[this.player_id], remainingSpace);
        //prepare tokens
        ["", "FromCan"].forEach(function (suffix) {
            if (!args["water" + suffix])
                return;
            var nbDroplet = args["water" + suffix][_this.player_id];
            var _loop_3 = function (index) {
                var element;
                //if From can take from can, and if you can't (i don't know why) create it
                if (suffix) {
                    element = _this.takeDroplet($("droplets" + suffix));
                }
                else {
                    element = _this._tokenManager.createToken($("waterboard"), 0);
                    _this.attachElementWithSlide(element, $("droplets" + suffix));
                }
                _this.onClick(element.id, function () {
                    if (!_this.isCurrentPlayerActive())
                        return; //useless?
                    var wasSelected = element.classList.contains("selected");
                    document
                        .querySelectorAll(".token.selected")
                        .forEach(function (elem) { return elem.classList.remove("selected"); });
                    if (!wasSelected) {
                        element.classList.add("selected");
                        _this.displayTitle(_this.fsr(_("${you} can choose a pot for this water"), {
                            you: _this.coloredYou(),
                        }));
                    }
                    else {
                        _this.resetTitle();
                    }
                });
            };
            for (var index = 0; index < nbDroplet; index++) {
                _loop_3(index);
            }
        });
        //prepare buttons
        var takeAction = function () {
            _this.takeAction({
                actionName: _this.stateName == "water" ? "actWater" : "actWaterSolo",
                cardIds: Object.values(JSON.parse($("btn-water").dataset.moves)),
            });
            $("btn-reset").innerText = _("Change mind");
            _this.replaceUnusedDropletIntoCan();
        };
        this.addPrimaryActionButton("btn-water", _("Confirm and store unused droplets"), function () {
            if (_this.areDropletsRemaining()) {
                _this.confirmationDialog("All unused droplets will be placed in your watering can", takeAction);
            }
            else {
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
            for (var index = 0; index < args.water[this.player_id]; index++) {
                // use playerPlans to premove token
                if (args.playerPlans[this.player_id][index]) {
                    debug("plan done");
                    this.planMoveToken(args.playerPlans[this.player_id][index]);
                }
            }
            this.replaceUnusedDropletIntoCan();
        }
    };
    LittleSucculentsGame.prototype.onEnteringStateClientBuy = function (args) {
        var _this = this;
        this._stocks["board"].setSelectionMode("single");
        this._stocks["board"].setSelectableCards(Object.values(args.buyableCards).map(function (c) { return _this.addStatics(c); }));
        this._stocks["board"].onSelectionChange = function (selection, lastChange) {
            _this.clearSelectable();
            if (selection.includes(lastChange)) {
                args.possiblePlaces[lastChange.type].forEach(function (slotId) {
                    _this.onClick(lastChange.type + slotId, function () {
                        _this.takeAction({
                            actionName: "actBuy",
                            cardId: lastChange.id,
                            state: slotId,
                        });
                    });
                });
            }
        };
        this.addResetClientStateButton();
    };
    LittleSucculentsGame.prototype.onEnteringStateClientChooseDestination = function (args) {
        var _this = this;
        this.addResetClientStateButton();
        //select active CardId
        this._stocks[this.player_id].setSelectionMode("single");
        //for first move you can swap two card
        this._stocks[this.player_id].setSelectableCards(!args.stateArgs.moves && args.stateArgs.remainingMoves == 2
            ? args.stateArgs.plants
            : [args.card]);
        this._stocks[this.player_id].selectCard(args.card, true);
        this._stocks[this.player_id].onSelectionChange = function (selection, lastChange) {
            if (lastChange.id == args.card.id) {
                _this.clearClientState();
            }
            else {
                args.stateArgs.moves = {};
                args.stateArgs.moves[args.card.id] = lastChange.state;
                args.stateArgs.moves[lastChange.id] = args.stateArgs.plants.find(function (c) { return c.id == args.card.id; }).state;
                _this.takeAction({
                    actionName: "actMovePlants",
                    moves: args.stateArgs.moves,
                });
            }
        };
        //empty spaces
        args.stateArgs.possibleEmptyPlaces.forEach(function (emptySpace) {
            //if empty space is already a destination, forget it
            if (args.stateArgs.moves &&
                Object.values(args.stateArgs.moves).includes(emptySpace)) {
                return;
            }
            else {
                _this.onClick("plant" + emptySpace, function () {
                    if (!args.stateArgs.moves) {
                        args.stateArgs.moves = {};
                    }
                    args.stateArgs.moves[args.card.id] = emptySpace;
                    _this.takeAction({
                        actionName: "actMovePlants",
                        moves: args.stateArgs.moves,
                    });
                });
            }
        });
        //space with cards (only for first move) // USELESS ONLY KEPT FOR UI REASON (good border appearing)
        if (!args.stateArgs.moves && args.stateArgs.remainingMoves == 2) {
            args.stateArgs.plants.forEach(function (plant) {
                //do not move on itself
                if (plant.id == args.card.id)
                    return;
                $("plant_" + plant.id).classList.add("selectable");
                _this._selectableNodes.push($("plant_" + plant.id));
            });
        }
    };
    LittleSucculentsGame.prototype.onEnteringStateClientCut = function (args) {
        var _this = this;
        this.forEachPlayer(function (player) {
            _this._stocks[player.id].setSelectionMode("single");
            _this._stocks[player.id].setSelectableCards(Object.values(args.cuttableCards).map(function (c) { return _this.addStatics(c); }));
            _this._stocks[player.id].onSelectionChange = function (selection, lastChange) {
                _this.clearSelectable();
                if (selection.includes(lastChange)) {
                    args.possiblePlantPlaces.forEach(function (slotId) {
                        _this.onClick(lastChange.type + slotId, function () {
                            _this.takeAction({
                                actionName: "actCut",
                                cardId: lastChange.id,
                                state: slotId,
                            });
                        });
                    });
                    _this.displayTitle(_("${you} must choose where to place your new succulent"));
                }
                else {
                    _this.displayTitle(_this.currentStateTitle);
                }
            };
        });
        this.addResetClientStateButton();
    };
    LittleSucculentsGame.prototype.onEnteringStateClientFlower = function (args) {
        var _this = this;
        this._stocks[this.player_id].setSelectionMode("single");
        this._stocks[this.player_id].setSelectableCards(Object.values(args.possiblePlants).map(function (c) { return _this.addStatics(c); }));
        this._stocks[this.player_id].onSelectionChange = function (selection, lastChange) {
            _this.clearSelectable();
            if (selection.includes(lastChange)) {
                var possibleColors = args.possibleColors[lastChange.id];
                if (possibleColors.length == 1) {
                    _this.takeAction({
                        actionName: "actFlower",
                        plantId: lastChange.id,
                        color: possibleColors[0],
                    });
                }
                else {
                    possibleColors.forEach(function (color) {
                        var flower = _this.getFlowerElem(color);
                        if (!flower) {
                            debug("Houston we have a pb with choosing a flower " + color);
                        }
                        else {
                            _this.onClick($(flower), function () {
                                _this.takeAction({
                                    actionName: "actFlower",
                                    plantId: lastChange.id,
                                    color: color,
                                });
                            });
                        }
                    });
                }
                _this.displayTitle(_("${you} must choose one flower color"));
            }
            else {
                _this.displayTitle(_this.currentStateTitle);
            }
        };
        this.addResetClientStateButton();
    };
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
    LittleSucculentsGame.prototype.attachElementWithSlide = function (element, toElement) {
        debug("attachElementWithSlide", element, toElement);
        // move an element to a destination element and attach it.
        this._animationManager.attachWithAnimation(new BgaSlideAnimation({ element: element }), toElement);
    };
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
    LittleSucculentsGame.prototype.takeDroplet = function (destination, playerId) {
        playerId = playerId !== null && playerId !== void 0 ? playerId : +this.player_id;
        var token = Token.takeToken($("waterCan-" + this.player_id));
        this.waterCards[playerId].tokenNb--;
        if (!token) {
            token = this._tokenManager.createToken($("waterboard"), 0);
        }
        this.attachElementWithSlide(token, destination);
        return token;
    };
    LittleSucculentsGame.prototype.storeDroplet = function (source, playerId) {
        playerId = playerId !== null && playerId !== void 0 ? playerId : +this.player_id;
        var token = Token.takeToken(source);
        if (token) {
            this.waterCards[playerId].tokenNb++;
            this._tokenManager.moveTokenOnCard(token, this.waterCards[playerId]);
        }
        else {
            debug("error with store Droplet", source, playerId);
        }
        return token;
    };
    // getBasicPots(): Card[] {
    //   return this._stocks[this.player_id]
    //     .getCards()
    //     .filter((c) => c.deck == "starter" && c.type == "pot");
    // }
    // moveBasicPots(direction: "close" | "open" = "open") {
    //   const basicPots = this.getBasicPots();
    //   debug("basic pots", basicPots);
    //   basicPots.forEach((pot) => {
    //     const newState =
    //       pot.state + (pot.state > 0 ? 1 : -1) * (direction == "open" ? 1 : -1);
    //     debug("newState", newState);
    //     if (
    //       this._stocks[this.player_id]
    //         .getCards()
    //         .every((c) => c.type != "pot" || c.state != newState)
    //     ) {
    //       pot.state = newState;
    //       this._cardManager.updateCardInformations(pot);
    //     }
    //   });
    // }
    LittleSucculentsGame.prototype.replaceUnusedDropletIntoCan = function (playerId) {
        var _this = this;
        if (playerId === void 0) { playerId = null; }
        playerId = playerId !== null && playerId !== void 0 ? playerId : this.player_id;
        $("token-container")
            .querySelectorAll(".token")
            .forEach(function (elem) {
            _this.storeDroplet($("token-container"));
        });
    };
    /**
     * adjust money counter
     */
    LittleSucculentsGame.prototype.pay = function (playerId, n) {
        this._counters["money-" + playerId].incValue(-n);
    };
    /**
     * move all selectable token to status bar
     */
    LittleSucculentsGame.prototype.resetMoveToken = function () {
        var _this = this;
        var tokens = document.querySelectorAll(".token.selectable");
        var args = this.getArgs();
        var index = 0;
        tokens.forEach(function (token) {
            index++;
            //move token
            var suffix = index <= args.water[_this.player_id] ? "" : "FromCan";
            _this.attachElementWithSlide(token, $("droplets" + suffix));
            token.classList.remove("selected");
            token.dataset.placeId = "";
            //store data
            var moves = JSON.parse($("btn-water").dataset.moves);
            //if this token was not attributed, increase by one possible moves.
            var cardId = moves[token.id];
            if (!cardId) {
                //token was in the can
                // this._counters["water-" + this.player_id].incValue(-1); //TODO this is buggy after a refresh
            }
            else {
                _this.possiblePlaces[cardId]++;
                delete moves[token.id];
            }
            $("btn-water").dataset.moves = JSON.stringify(moves);
        });
        $("btn-water").innerText = _("Confirm and store unused droplets");
        $("btn-water").dataset.remainingDroplets = args.water[this.player_id];
        $("btn-reset").style.display = "none";
        $("btn-water").style.display = "inline-block";
    };
    LittleSucculentsGame.prototype.storeWaterToken = function () {
        var _a;
        //select token
        var element = ((_a = document.querySelector(".token.selected")) !== null && _a !== void 0 ? _a : document.querySelector("#token-container .token"));
        if (!element) {
            this.showMessage(_("There are no droplet to place left, but you can select a droplet to move"), "error");
            return;
        }
        var card = this.waterCards[this.player_id];
        //move token
        var _b = this._tokenManager.getAvailablePlaces(card, this._cardManager.getCardElement(card)), busyPlaces = _b[0], availablePlaces = _b[1];
        element.dataset.placeId = availablePlaces[0].toString();
        this._tokenManager.moveTokenOnCard(element, card);
        element.classList.remove("selected");
        this.resetTitle();
    };
    LittleSucculentsGame.prototype.planMoveToken = function (cardId) {
        var _a;
        if (cardId === void 0) { cardId = null; }
        //check if move is possible
        if (cardId && this.possiblePlaces[cardId] == 0) {
            this.showMessage(_("This card is full"), "error");
            return;
        }
        var card = this._stocks[this.player_id]
            .getCards()
            .find(function (card) { return card.id == +cardId; });
        //select token
        var element = ((_a = document.querySelector(".token.selected")) !== null && _a !== void 0 ? _a : document.querySelector("#token-container .token"));
        if (!element) {
            this.showMessage(_("There are no droplet to place left, but you can select a droplet to move"), "error");
            return;
        }
        //move token
        var _b = this._tokenManager.getAvailablePlaces(card, this._cardManager.getCardElement(card)), busyPlaces = _b[0], availablePlaces = _b[1];
        element.dataset.placeId = availablePlaces[0].toString();
        this._tokenManager.moveTokenOnCard(element, card);
        element.classList.remove("selected");
        this.resetTitle();
        //store data
        var moves = JSON.parse($("btn-water").dataset.moves);
        //if this token was not attributed, lower by one possible moves.
        if (moves[element.id] === undefined) {
            $("btn-water").dataset.remainingDroplets = (+$("btn-water").dataset.remainingDroplets - 1).toString();
        }
        else {
            this.possiblePlaces[moves[element.id]]++;
        }
        this.possiblePlaces[cardId]--;
        moves[element.id] = cardId;
        $("btn-water").dataset.moves = JSON.stringify(moves);
        $("btn-reset").style.display = "inline-block";
    };
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
    LittleSucculentsGame.prototype.areDropletsRemaining = function () {
        return document.querySelectorAll("#token-container .token").length != 0;
    };
    LittleSucculentsGame.prototype.getFlowerElem = function (color) {
        // debug(".token .flower ." + color);
        return document.querySelector(".token.flower." + color);
    };
    LittleSucculentsGame.prototype.addStatics = function (c) {
        if (c)
            Object.assign(c, CARDS_DATA[c.dataId]);
        return c;
    };
    LittleSucculentsGame.prototype.getPlantIdOnSpaceId = function (spaceId) {
        var elemId = $("plant" + spaceId).querySelector(".card.plant").id;
        return +elemId.split("_")[1];
    };
    /**
     * make active all slots where a card can be played
     * (usefull to hide useless slots)
     */
    LittleSucculentsGame.prototype.activePossibleSlots = function () {
        document.querySelectorAll(".gamezone-cards").forEach(function (gamezone) {
            var _loop_4 = function (index) {
                [1, -1].forEach(function (side) {
                    var adjacentNumber = index == 0 ? 0 : index - 1;
                    var plantElem = gamezone.querySelector("[data-slot-id='plant" + index * side + "']");
                    var potElem = gamezone.querySelector("[data-slot-id='pot" + index * side + "']");
                    var previousPotElem = gamezone.querySelector("[data-slot-id='pot" + adjacentNumber * side + "']");
                    potElem.classList.toggle("active", potElem.childNodes.length > 0 ||
                        previousPotElem.childNodes.length > 0);
                    plantElem.classList.toggle("active", potElem.classList.contains("active"));
                });
            };
            for (var index = 0; index <= 13; index++) {
                _loop_4(index);
            }
        });
    };
    LittleSucculentsGame.prototype.resetDecks = function () {
        Object.values(this._stocks).forEach(function (stock) {
            return stock.setSelectionMode("none");
        });
    };
    LittleSucculentsGame.prototype.addResetButton = function () {
        var _this = this;
        if ($("btn-reset")) {
            $("btn-reset").style.display = !this.isCurrentPlayerActive()
                ? "inline-block"
                : "none";
            return;
        }
        this.addSecondaryActionButton("btn-reset", this.isCurrentPlayerActive() ? _("Reset") : _("Change mind"), function () {
            if (!_this.isCurrentPlayerActive()) {
                _this.takeAction({
                    actionName: "actChangeMind",
                    notActive: true,
                });
                $("btn-reset").innerText = _("Reset");
            }
            _this.resetMoveToken();
        });
        $("btn-reset").style.display = !this.isCurrentPlayerActive()
            ? "inline-block"
            : "none";
    };
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
    LittleSucculentsGame.prototype.displayChoicesForDie = function () {
        // } //   this._diceManager.unselectAll(); //   }); //     actionName: "actModifyDie", //     value: index, //     diceIds: this._diceManager.getAllSelectedDice().map((die) => die.id), //   this.takeAction({ // callback = (index) => { // nDieToSelect = 1,
        debug("displayChoicesForDie");
    };
    LittleSucculentsGame.prototype.updateBtnPay = function () {
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
    };
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
    LittleSucculentsGame.prototype.notif_moveCard = function (n) {
        this._cardManager.updateCardInformations(n.args.card);
        this.activePossibleSlots();
    };
    //flag to change buttons
    LittleSucculentsGame.prototype.notif_playerReady = function (n) {
        if (this.isItMe(n.args.player_id)) {
            $("btn-water").style.display = "none";
            $("btn-reset").style.display = "inline-block";
        }
    };
    LittleSucculentsGame.prototype.notif_updateCard = function (n) {
        this._cardManager.updateCardInformations(n.args.card);
    };
    LittleSucculentsGame.prototype.notif_updateDeck = function (n) {
        this.updateCards(n.args);
        // (this._stocks["water"] as Deck<Card>).addCard(
        //   this.addStatics(n.args.water.topCard)
        // );
        // (this._stocks["water"] as Deck<Card>).setCardNumber(n.args.water.n);
    };
    LittleSucculentsGame.prototype.notif_updatePlayers = function (n) {
        this._playerManager.updatePlayers(n.args);
    };
    LittleSucculentsGame.prototype.notif_pay = function (n) {
        this.pay(n.args.player_id, n.args.n);
        this._cardManager.updateCardInformations(n.args.moneyPlant);
    };
    LittleSucculentsGame.prototype.notif_transfert = function (n) {
        var _this = this;
        var fromElem = this._cardManager.getCardElement(this.addStatics(n.args.from));
        for (var index = 0; index < n.args.n; index++) {
            var element = fromElem.querySelector(".token");
            if (!element)
                debug("problem in notif transfert", index, fromElem, n.args.to);
            this._tokenManager.moveTokenOnCard(element, n.args.to);
        }
        this.wait(1000).then(function () {
            _this._cardManager.updateCardInformations(n.args.from);
            _this._cardManager.updateCardInformations(n.args.to);
        });
    };
    LittleSucculentsGame.prototype.notif_drawCard = function (n) {
        var from = n.args.card.location == "plantboard" ? "deckplant" : "deckpot";
        this._stocks["board"].addCard(n.args.card, {
            fromStock: this._stocks[from],
        });
    };
    LittleSucculentsGame.prototype.notif_refreshUi = function (n) {
        this.updateCards(n.args.cards);
        this.activePossibleSlots();
        $("droplets").replaceChildren();
        $("dropletsFromCan").replaceChildren();
        this._playerManager.updatePlayers(n.args.players);
        this.updateWaterCans(n.args.players);
    };
    LittleSucculentsGame.prototype.notif_clearTurn = function (n) {
        var _this = this;
        n.args.notifIds.forEach(function (logId) {
            var _a;
            var log = "log_" + _this._notif_uid_to_log_id[logId];
            (_a = $(log)) === null || _a === void 0 ? void 0 : _a.classList.add("canceled");
        });
    };
    LittleSucculentsGame.prototype.notif_startAction = function (n) {
        this._turnCounter.toValue(n.args.turn);
        if (n.args.turn == 12) {
            this.displayCaution();
        }
    };
    LittleSucculentsGame.prototype.notif_newScore = function (n) {
        this._playerManager.updatePlayer(n.args.player);
        this.gamedatas.players[n.args.player.id].scoreDetails = n.args.scoreDetail;
        //TODO display detailled score for each plant on tooltip
        this._cardManager.updateAllToolTips();
    };
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
    LittleSucculentsGame.prototype.board_tpl = function (player) {
        return "<div id='gamezone-".concat(player.id, "' class='succulents-gamezone' style='border-color:#").concat(player.color, "'>\n      <div class='player-board-name' style='background-color:#").concat(player.color, "'>\n        ").concat(player.name, "\n      </div>\n      <div id='gamezone-cards-").concat(player.id, "' class='gamezone-cards'>\n        \n      </div>\n      <div id='waterCan-").concat(player.id, "' class=\"waterCan\"></div>\n      \n    </div>");
    };
    // semi generic
    LittleSucculentsGame.prototype.tplPlayerPanel = function (player) {
        return "<div id='succulents-player-infos_".concat(player.id, "' class='player-infos'>\n          <div class='money-counter counter' id='money-").concat(player.id, "'></div>\n          <div id='watercan-").concat(player.id, "'></div>\n          <div class='water-counter counter' id='water-").concat(player.id, "'></div>\n          <div class=\"first-player-holder\" id='first-player-").concat(player.id, "'>").concat(player.isFirst ? '<div id="firstPlayer"></div>' : "", "</div>\n        </div>");
    };
    LittleSucculentsGame.prototype.setupCards = function (gamedatas) {
        var _this = this;
        [/*"discardplant", "discardpot",*/ "water"].forEach(function (deck) {
            _this._stocks[deck] = new Deck(_this._cardManager, $(deck), {
                counter: { show: true, hideWhenEmpty: true },
                autoUpdateCardNumber: false,
                autoRemovePreviousCards: true,
                topCard: gamedatas.cards[deck].topCard
                    ? _this.addStatics(gamedatas.cards[deck].topCard)
                    : undefined,
                cardNumber: gamedatas.cards[deck].n,
            });
        });
        ["deckplant", "deckpot"].forEach(function (deck) {
            _this._stocks[deck] = new Deck(_this._cardManager, $(deck), {
                counter: { show: true, hideWhenEmpty: false },
                autoUpdateCardNumber: true,
                autoRemovePreviousCards: false,
                cardNumber: gamedatas.cards[deck].n,
            });
        });
        this._stocks["waterboard"] = new Deck(this._cardManager, $("waterboard"), {});
        $("waterboard").dataset.label = _("Current Weather :");
        $("water").dataset.label = _("Draw pile :");
        this._stocks["board"] = new SlotStock(this._cardManager, $("board"), {
            slotsIds: ["pot1", "pot2", "pot3", "plant1", "plant2", "plant3"],
            mapCardToSlot: function (card) {
                card = _this.addStatics(card);
                return card.type + card.state;
            },
        });
        var colors = ["red", "green", "blue", "pink", "yellow", "orange"];
        this._stocks["visibleDeck"] = new SlotStock(this._cardManager, $("visibleDeck"), {
            slotsIds: colors,
            mapCardToSlot: function (card) {
                card = _this.addStatics(card);
                return card.color;
            },
        });
        colors.forEach(function (color) {
            var elem = document.querySelector("[data-slot-id='".concat(color, "']"));
            _this.addAutomaticCounter(elem);
            //create flower token
            var flowerElem = document.createElement("div");
            flowerElem.classList.add("token", "flower", color);
            document.querySelector("[data-slot-id='".concat(color, "']")).append(flowerElem);
        });
        var slotIds = [];
        for (var index = -13; index <= 13; index++) {
            slotIds.push("pot" + index);
            slotIds.push("plant" + index);
        }
        Object.keys(gamedatas.players).forEach(function (playerId) {
            _this._stocks[playerId] = new SlotStockForSucculents(_this._cardManager, $("gamezone-cards-" + playerId), {
                slotsIds: slotIds,
                mapCardToSlot: function (card) {
                    card = _this.addStatics(card);
                    return card.type + card.state;
                },
                wrap: "wrap",
            });
            //waterCan
            _this._stocks["waterCan-" + playerId] = new AllVisibleDeck(_this._cardManager, $("waterCan-" + playerId), {});
        });
        //discard
        this._stocks["discard"] = new VoidStock(this._cardManager, $("discard"));
        this.updateCards(gamedatas.cards);
    };
    LittleSucculentsGame.prototype.updateCards = function (cards) {
        var _this = this;
        [/*"discardplant", "discardpot", */ "water"].forEach(function (deck) {
            if (cards[deck]) {
                _this._stocks[deck].setCardNumber(cards[deck].n, cards[deck].topCard ? _this.addStatics(cards[deck].topCard) : undefined);
            }
        });
        ["deckplant", "deckpot"].forEach(function (deck) {
            if (cards[deck] !== undefined) {
                _this._stocks[deck].setCardNumber(cards[deck]);
            }
        });
        ["board", "player", "visibleDeck"].forEach(function (deck) {
            if (cards[deck]) {
                cards[deck].forEach(function (card) {
                    return _this._cardManager.updateCardInformations(_this.addStatics(card));
                });
            }
        });
        if (cards.waterboard) {
            this._stocks["waterboard"].addCard(this.addStatics(cards.waterboard));
        }
        if (cards.flowerableColors) {
            //display available flowers
            cards.flowerableColors.forEach(function (color) {
                var elem = document.querySelector(".token.flower." + color);
                document.querySelector("[data-slot-id='".concat(color, "']")).append(elem);
            });
        }
        //remove slots of each player that are not reachable for now
        this.activePossibleSlots();
    };
    LittleSucculentsGame.prototype.updateWaterCans = function (players) {
        var _this = this;
        Object.keys(players).forEach(function (playerId) {
            if (!_this.waterCards[playerId]) {
                _this.waterCards[playerId] = {
                    deck: "starter",
                    id: +playerId,
                    location: "waterCan",
                    state: 0,
                    extraDatas: {},
                    playerId: +playerId,
                    dataId: 0,
                    tokenNb: players[playerId].water,
                    flowered: false,
                };
            }
            else {
                _this.waterCards[playerId].tokenNb = players[playerId].water;
            }
            _this._cardManager.updateCardInformations(_this.waterCards[playerId]);
        });
    };
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
    LittleSucculentsGame.prototype.addTooltips = function () {
        var _this = this;
        this._tooltips = [
            { name: "water", hint: _("Deck of Weather Cards") },
            { name: "waterboard", hint: _("Weather at the end of this turn") },
            { name: "deckplant", hint: _("Deck of Plant Cards") },
            { name: "deckpot", hint: _("Deck of Pot Cards") },
            { name: "firstPlayer", hint: _("First player token") },
            { name: "droplets", hint: _("Droplets from weather or tend action") },
            { name: "dropletsFromCan", hint: _("Droplets from your can") },
            { name: "money-counter", hint: _("Money of the player"), type: "class" },
            {
                name: "water-counter",
                hint: _("Water can of the player"),
                type: "class",
            },
        ];
        this._tooltips.forEach(function (tooltip) {
            var _a, _b;
            if (tooltip.type == "class") {
                _this.addTooltipToClass(tooltip.name, tooltip.hint, (_a = tooltip.action) !== null && _a !== void 0 ? _a : "");
            }
            else {
                _this.addTooltip(tooltip.name, tooltip.hint, (_b = tooltip.action) !== null && _b !== void 0 ? _b : "");
            }
        });
    };
    LittleSucculentsGame.prototype.addUndoButton = function (condition, callback) {
        var _this = this;
        if (condition === void 0) { condition = true; }
        if (condition) {
            this.addSecondaryActionButton("btn-undo", _("Undo"), function () {
                _this.takeAction({
                    actionName: "actUndo",
                });
                if (callback)
                    callback();
            }, "restartAction");
        }
    };
    LittleSucculentsGame.prototype.addAutomaticCounter = function (elem) {
        elem.classList.add("automaticCounter");
        var observer = new MutationObserver(function (mutationRecords) {
            mutationRecords.forEach(function (record) {
                record.target.dataset.nb = record.target
                    .querySelectorAll(".card")
                    .length.toString();
            });
        });
        observer.observe(elem, { childList: true });
    };
    LittleSucculentsGame.prototype.insertIcons = function (text, preventRecursion) {
        if (preventRecursion === void 0) { preventRecursion = false; }
        var translations = [
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
        var index = 0; //assuming there is only 1 serie of indexed icons in a card
        for (var _i = 0, translations_1 = translations; _i < translations_1.length; _i++) {
            var entry = translations_1[_i];
            text = text.replaceAll(entry[0], entry[2] && entry[2] == "text"
                ? entry[1]
                : entry[1] == "numberedIcon"
                    ? "<span class='inline-icon icon-$2' data-nb='$1'></span>"
                    : entry[1] == "indexedIcons"
                        ? "<div class=\"box index".concat(index++, "\"><span class='inline-icon icon-$1'></span>X $2</div>")
                        : entry[1] == "method"
                            ? this[entry[2]]()
                            : (entry[0] instanceof RegExp ? "$1" : "") + //assuming that all regex have a first capturing group useless
                                "<span class='inline-icon icon-".concat(entry[1], "'></span>"));
        }
        return text;
    };
    LittleSucculentsGame.prototype.createNumberButtons = function (callback, valuesToDisable, from, to) {
        if (valuesToDisable === void 0) { valuesToDisable = []; }
        if (from === void 0) { from = 1; }
        if (to === void 0) { to = 6; }
        var _loop_5 = function (index) {
            if (!$("btn-" + index)) {
                this_1.addActionButton("btn-" + index, "" + index, function () {
                    callback(index);
                });
            }
            var elem = $("btn-" + index);
            elem.style.display = "inline-block";
            elem.classList.toggle("disabled", valuesToDisable.includes(index));
        };
        var this_1 = this;
        for (var index = from; index <= to; index++) {
            _loop_5(index);
        }
    };
    /**
     * Return sum of numbers
     * @param array numbers to sum
     * @returns
     */
    LittleSucculentsGame.prototype.arraySum = function (array) {
        return array.reduce(function (previousValue, currentValue) { return currentValue + previousValue; }, 0);
    };
    //reset the client state (and perform some extra actions if needed)
    LittleSucculentsGame.prototype.addResetClientStateButton = function (callback, customLabel) {
        var _this = this;
        if (customLabel === void 0) { customLabel = undefined; }
        this.addSecondaryActionButton("btn-cancel", customLabel !== null && customLabel !== void 0 ? customLabel : _("Cancel"), function () {
            if (callback)
                callback();
            else
                _this.clearPossible();
            _this.restoreServerGameState();
        });
    };
    LittleSucculentsGame.prototype.addPassButton = function (condition, callback, actionName) {
        var _this = this;
        if (condition === void 0) { condition = true; }
        if (actionName === void 0) { actionName = "actDeny"; }
        if (condition) {
            this.addSecondaryActionButton("btn-pass", _("Pass"), function () {
                _this.takeAction({
                    actionName: actionName,
                });
                if (callback)
                    callback();
            });
        }
    };
    LittleSucculentsGame.prototype.displayTitle = function (title) {
        var formatedTitle = this.fsr(title, { you: this.coloredYou() });
        $("pagemaintitletext").innerHTML = formatedTitle;
    };
    LittleSucculentsGame.prototype.resetTitle = function () {
        this.displayTitle(this.currentStateTitle);
    };
    LittleSucculentsGame.prototype.displayCaution = function (text, bErasePrevious) {
        if (bErasePrevious === void 0) { bErasePrevious = true; }
        text = text !== null && text !== void 0 ? text : _("Caution: this is the last turn !");
        dojo.place('<div id="LSU_message">' + text + "</div>", "LSU_caution", bErasePrevious ? "only" : "first");
        dojo.connect($("LSU_caution"), "onclick", this, function () {
            dojo.destroy("LSU_message");
        });
    };
    /*
     *   Create and place a counter in a div container
     */
    LittleSucculentsGame.prototype.addCounterOnDeck = function (containerId, initialValue) {
        var counterId = containerId + "_deckinfo";
        var div = "<div id=\"".concat(counterId, "\" class=\"deckinfo\">0</div>");
        dojo.place(div, containerId);
        var counter = this.createCounter(counterId, initialValue);
        if (initialValue)
            $(containerId).classList.remove("empty");
        return counter;
    };
    /**
     * This method can be used instead of addActionButton, to add a button which is an image (i.e. resource). Can be useful when player
     * need to make a choice of resources or tokens.
     */
    LittleSucculentsGame.prototype.addImageActionButton = function (id, handler, tooltip, classes, bcolor) {
        if (classes === void 0) { classes = null; }
        if (bcolor === void 0) { bcolor = "blue"; }
        if (classes)
            classes.push("shadow bgaimagebutton");
        else
            classes = ["shadow bgaimagebutton"];
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
    };
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
    LittleSucculentsGame.prototype.getTokenDiv = function (key, args) {
        // debug("getTokenDiv", key, args);
        // ... implement whatever html you want here, example from sharedcode.js
        var token_id = args[key];
        switch (key) {
            case "points":
            case "point":
                return "<span class=\"inline-icon icon-vp\"></span>";
            default:
                return token_id;
        }
    };
    LittleSucculentsGame.prototype.isItMe = function (playerId) {
        return playerId == parseInt(this.player_id);
    };
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
    LittleSucculentsGame.prototype.forEachPlayer = function (callback) {
        Object.values(this.gamedatas.players).forEach(callback);
    };
    LittleSucculentsGame.prototype.getArgs = function () {
        return this.gamedatas.gamestate.args;
    };
    LittleSucculentsGame.prototype.clientState = function (name, descriptionmyturn, args) {
        args.you = this.coloredYou();
        this.setClientState(name, {
            descriptionmyturn: descriptionmyturn,
            args: args,
        });
    };
    LittleSucculentsGame.prototype.strReplace = function (str, subst) {
        return dojo.string.substitute(str, subst);
    };
    LittleSucculentsGame.prototype.clearClientState = function () {
        this.clearPossible();
        this.restoreServerGameState();
    };
    LittleSucculentsGame.prototype.translate = function (t) {
        if (typeof t === "object") {
            return this.format_string_recursive(t.log, t.args);
        }
        else {
            return _(t);
        }
    };
    LittleSucculentsGame.prototype.fsr = function (log, args) {
        return this.format_string_recursive(log, args);
    };
    LittleSucculentsGame.prototype.onSelectN = function (elements, n, callback) {
        var _this = this;
        var selectedElements = [];
        var updateStatus = function () {
            if ($("btnConfirmChoice"))
                $("btnConfirmChoice").remove();
            if (selectedElements.length == n) {
                _this.addPrimaryActionButton("btnConfirmChoice", _("Confirm"), function () {
                    if (callback(selectedElements)) {
                        selectedElements = [];
                        updateStatus();
                    }
                });
            }
            if ($("btnCancelChoice"))
                $("btnCancelChoice").remove();
            if (selectedElements.length > 0) {
                _this.addSecondaryActionButton("btnCancelChoice", _("Cancel"), function () {
                    selectedElements = [];
                    updateStatus();
                });
            }
            Object.keys(elements).forEach(function (id) {
                var elt = elements[id];
                var selected = selectedElements.includes(id);
                elt.classList.toggle("selected", selected);
                elt.classList.toggle("selectable", selected || selectedElements.length < n);
            });
        };
        Object.keys(elements).forEach(function (id) {
            var elt = elements[id];
            _this.onClick(elt, function () {
                var index = selectedElements.findIndex(function (t) { return t == id; });
                if (index === -1) {
                    if (selectedElements.length >= n)
                        return;
                    selectedElements.push(id);
                }
                else {
                    selectedElements.splice(index, 1);
                }
                updateStatus();
            });
        });
    };
    return LittleSucculentsGame;
}(GameGui));
