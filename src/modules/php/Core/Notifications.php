<?php

namespace LSU\Core;

use LSU\Managers\Cards;
use LSU\Managers\Players;
use LSU\Helpers\Utils;
use LSU\Core\Globals;

class Notifications
{
  public static function pay($player, $n)
  {
    $data = [
      'player' => $player,
      'n' => $n,
      'moneyPlant' => $player->getPlant(0),
      'preserve' => ['moneyPlant']
    ];
    $msg = _('${player_name} pays ${n} to buy a new card');
    static::notifyAll('pay', $msg, $data);
  }

  public static function place($card)
  {
    $data = [
      'card' => $card,
    ];
    static::notifyAll('moveCard', '', $data);
  }

  public static function updatePlayers()
  {
    static::notifyAll('updatePlayers', '', Players::getUiData());
  }



  /*************************
   **** GENERIC METHODS ****
   *************************/

  public static function refreshUi()
  {
    $data = Game::get()->getAllDatas();
    static::notifyAll('refreshUi', '', $data);
  }

  public static function clearTurn($player, $notifIds)
  {
    static::notifyAll('clearTurn', _('${player_name} cancels his turn'), ['player' => $player, 'notifIds' => $notifIds]);
  }

  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  /*********************
   **** UPDATE ARGS ****
   *********************/

  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$data)
  {
    if (isset($data['player'])) {
      $data['player_name'] = $data['player']->getName();
      $data['player_id'] = $data['player']->getId();
      unset($data['player']);
    }

    if (isset($data['player2'])) {
      $data['player_name2'] = $data['player2']->getName();
      $data['player_id2'] = $data['player2']->getId();
      unset($data['player2']);
    }
  }

  //          █████                          █████     ███                     
  //         ░░███                          ░░███     ░░░                      
  //  ██████  ░███████    ██████   ██████   ███████   ████  ████████    ███████
  // ███░░███ ░███░░███  ███░░███ ░░░░░███ ░░░███░   ░░███ ░░███░░███  ███░░███
  //░███ ░░░  ░███ ░███ ░███████   ███████   ░███     ░███  ░███ ░███ ░███ ░███
  //░███  ███ ░███ ░███ ░███░░░   ███░░███   ░███ ███ ░███  ░███ ░███ ░███ ░███
  //░░██████  ████ █████░░██████ ░░████████  ░░█████  █████ ████ █████░░███████
  // ░░░░░░  ░░░░ ░░░░░  ░░░░░░   ░░░░░░░░    ░░░░░  ░░░░░ ░░░░ ░░░░░  ░░░░░███
  //                                                                   ███ ░███
  //                                                                  ░░██████ 
  //                                                                   ░░░░░░  

  public static function cheat()
  {
    static::notifyAll('refresh', "", []);
  }

  public static function invitePlayersToAlpha($name, $message, $data)
  {
    static::notify(Players::getCurrent(), $name, $message, $data);
  }
}
