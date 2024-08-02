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
  return declare(
    "bgagame.littlesucculents",
    [customgame.game, littlesucculents.cheatModule, littlesucculents.zoomUI],
    new LittleSucculentsGame()
  );
});
