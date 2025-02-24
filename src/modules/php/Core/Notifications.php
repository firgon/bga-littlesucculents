<?php

namespace LSU\Core;

use LSU\Managers\Cards;
use LSU\Managers\Players;
use LSU\Helpers\Utils;
use LSU\Core\Globals;

class Notifications
{
  public static function startActionPhase()
  {
    static::notifyAll('startAction', clienttranslate('Actions phase'), ['turn' => 12 - Cards::countInLocation(WATER), 'preserve' => ['turn']]);
  }

  public static function startWaterPhase()
  {
    static::notifyAll('startWater', clienttranslate('Season growth phase'), ['water' => Cards::getCurrentWeather(), 'preserve' => ['water']]);
  }

  public static function drawCard($card)
  {
    $data = [
      'card' => $card
    ];
    static::notifyAll('drawCard', '', $data);
  }

  public static function getTranslatableColors($c)
  {
    $translatableColor = [
      GREEN => clienttranslate('green'),
      RED => clienttranslate('red'),
      YELLOW => clienttranslate('yellow'),
      PINK => clienttranslate('pink'),
      BLUE => clienttranslate('blue'),
      ORANGE => clienttranslate('orange')
    ];
    return $translatableColor[$c];
  }

  public static function flower($player, $card, $color)
  {

    $data = [
      'player' => $player,
      'color' => static::getTranslatableColors($color),
      'card' => $card
    ];
    static::message(clienttranslate('${player_name} flowers his ${cardName} and gets the ${color} flower'), $data);
  }

  public static function transfert($fromCard, $toCard, $n)
  {
    $data = [
      "from" => $fromCard,
      "to" => $toCard,
      "n" => $n
    ];
    static::notifyAll('transfert', '', $data);
  }

  public static function loseToken($card, $n)
  {
    $translatableTokenType = [
      PLANT => clienttranslate('leaf token(s)'),
      POT => clienttranslate('water droplet(s)')
    ];
    $translatableCardType = [
      PLANT => clienttranslate('succulent'),
      POT => clienttranslate('pot')
    ];
    $data = [
      'card' => $card,
      'n' => $n,
      'cardType' => $translatableCardType[$card->getType()],
      'player' => Players::get($card->getPlayerId()),
      'tokenName' => $translatableTokenType[$card->getType()],
      'i18n' => ['tokenName', 'cardType']
    ];
    static::notifyAll('updateCard', clienttranslate('${player_name} adjusts tokens number on his ${cardType} and loses ${n} ${tokenName}'), $data);
  }

  public static function newScore($player, $scoreDetail)
  {
    $data = [
      'player' => $player,
      'scoreDetail' => $scoreDetail
    ];
    static::notifyAll('newScore', '', $data);
  }

  public static function pay($player, $n, $card)
  {
    $data = [
      'player' => $player,
      'n' => $n,
      'card' => $card,
      'moneyPlant' => $player->getPlant(0),
      'preserve' => ['moneyPlant']
    ];
    $msg = clienttranslate('${player_name} pays ${n} to buy a new ${cardName} card ${cardLog}');
    static::notifyAll('pay', $msg, $data);
  }

  public static function place($card)
  {
    $data = [
      'card' => $card,
    ];
    static::notifyAll('moveCard', '', $data);
  }

  public static function playerReady($pId)
  {
    $msg = clienttranslate('${player_name} waters his succulents');
    $data = ['player' => Players::get($pId)];
    static::notifyAll('playerReady', $msg, $data);
  }

  public static function updateCard($card)
  {
    $data = [
      'card' => $card,
    ];
    static::notifyAll('updateCard', '', $data);
  }

  public static function updateDeck($deck)
  {
    $data = [
      $deck => [
        'n' => Cards::countInLocation($deck),
        'topCard' => Cards::getTopOf($deck)
      ],
    ];
    static::notifyAll('updateDeck', '', $data);
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
    static::notifyAll('clearTurn', clienttranslate('${player_name} cancels his turn'), ['player' => $player, 'notifIds' => $notifIds]);
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
    }

    if (isset($data['player2'])) {
      $data['player_name2'] = $data['player2']->getName();
      $data['player_id2'] = $data['player2']->getId();
    }
    if (isset($data['card'])) {
      $data['cardName'] = $data['card']->getName();
      $data['i18n'][] = 'cardName';
      $data['cardLog'] = '';
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
