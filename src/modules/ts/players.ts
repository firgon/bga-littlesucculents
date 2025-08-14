class Players {
  constructor(private gameui: GameGui) {}

  updatePlayer(player: Player) {
    if (player.isFirst) {
      (this.gameui as GretchensGardenGame).attachElementWithSlide(
        $("firstPlayer"),
        $(`first-player-${player.id}`)
      );
    }

    this.gameui._counters["water-" + player.id].toValue(player.water);

    if (player.money) {
      this.gameui._counters["money-" + player.id].toValue(player.money);
    }

    this.gameui.scoreCtrl[player.id].toValue(player.score);
  }

  setupPlayers(gamedatas: Gamedatas) {
    for (const playerId in gamedatas.players) {
      const player = gamedatas.players[playerId];

      this.gameui.place(
        "tplPlayerPanel",
        player,
        "overall_player_board_" + playerId
      );

      this.gameui._counters["water-" + playerId] = this.gameui.createCounter(
        "water-" + playerId,
        player.water
      );

      this.gameui._counters["money-" + playerId] = this.gameui.createCounter(
        "money-" + playerId,
        player.money
      );

      this.gameui.place("board_tpl", player, "table");
    }

    this.myUpdatePlayerOrdering("gamezone", "table");
  }

  /**
   * Update player Panel (firstPlayer token, scores...)
   * @param players
   */
  updatePlayers(players: { [playerId: number]: Player }) {
    for (const playerId in players) {
      const player = players[playerId];

      this.updatePlayer(player);
    }
  }

  //place each player board in good order.
  myUpdatePlayerOrdering(elementName: string, container: string): void {
    for (let i in this.gameui.gamedatas.playerorder) {
      const playerId = this.gameui.gamedatas.playerorder[i];
      if (!$(elementName + "-" + playerId)) {
        debug("error with " + elementName + "-" + playerId);
      } else {
        dojo.place(elementName + "-" + playerId, container, "last");
      }
    }
  }

  getPlayers() {
    return Object.values(this.gameui.gamedatas.players);
  }

  getColoredName(pId: number) {
    let name = this.gameui.gamedatas.players[pId].name;
    return this.gameui.coloredPlayerName(name);
  }

  getPlayerColor(pId: number) {
    return this.gameui.gamedatas.players[pId].color;
  }

  isSolo() {
    return this.getPlayers().length == 1;
  }
}
