define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  getLibUrl("bga-autofit", "1.x"),
  g_gamethemeurl + "modules/js/Core/game.js",
  g_gamethemeurl + "modules/js/Core/modal.js",
  g_gamethemeurl + "modules/js/Utils/cheatModule.js",
  g_gamethemeurl + "modules/js/zoomUI.js",
], function (dojo, declare, gamegui, counter, BgaAutofit) {
  (window as any).BgaAutofit = BgaAutofit;
  return declare(
    "bgagame.gretchensgarden",
    [customgame.game, gretchensgarden.cheatModule, gretchensgarden.zoomUI],
    new GretchensGardenGame()
  );
});
