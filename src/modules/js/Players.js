define(["dojo", "dojo/_base/declare"], (dojo, declare) => {
  return declare("littlesucculents.players", null, {
    /*
     *   █████████                                          ███
     *  ███░░░░░███                                        ░░░
     * ███     ░░░   ██████  ████████    ██████  ████████  ████   ██████
     *░███          ███░░███░░███░░███  ███░░███░░███░░███░░███  ███░░███
     *░███    █████░███████  ░███ ░███ ░███████  ░███ ░░░  ░███ ░███ ░░░
     *░░███  ░░███ ░███░░░   ░███ ░███ ░███░░░   ░███      ░███ ░███  ███
     * ░░█████████ ░░██████  ████ █████░░██████  █████     █████░░██████
     *  ░░░░░░░░░   ░░░░░░  ░░░░ ░░░░░  ░░░░░░  ░░░░░     ░░░░░  ░░░░░░
     *
     *
     *
     */

    // semi generic
    tplPlayerPanel(player) {
      return `<div id='succulents-player-infos_${player.id}' class='player-infos'>
        <div class='water' id='water-${player.id}'></div>
        <div class="first-player-holder" id='first-player-${player.id}'></div>
      </div>`;
    },
  });
});
