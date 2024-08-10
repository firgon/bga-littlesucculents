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
      'n' => $n
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

  private static function addDataCoord(&$data, $x, $y)
  {
    $data['x'] = $x;
    $data['y'] = $y;
    $data['displayX'] = $x + 1;
    $data['displayY'] = $y + 1;
  }

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

    if (isset($data['card'])) {
      $data['value'] = $data['card']->getValue();
      $data['color'] = $data['card']->getColor();
      $data['cardId'] = $data['card']->getId();
      unset($data['card']);
      if (isset($data['card2'])) {
        $data['value2'] = $data['card2']->getValue();
        $data['color2'] = $data['card2']->getColor();
        $data['cardId2'] = $data['card2']->getId();
        unset($data['card2']);
        if (isset($data['card3'])) {
          $data['value3'] = $data['card3']->getValue();
          $data['color3'] = $data['card3']->getColor();
          $data['cardId3'] = $data['card3']->getId();
          unset($data['card3']);
        }
      }
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
