<?php

namespace LSU\Managers;

use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Core\Stats;
use LSU\Helpers\Collection;
use LSU\Helpers\Utils;
use LSU\Models\Player;

/*
 * Players manager : allows to easily access players ...
 *  a player is an instance of Player class
 */

class Players extends \LSU\Helpers\DB_Manager
{
  protected static $table = 'player';
  protected static $primary = 'player_id';
  protected static function cast($row)
  {
    return new \LSU\Models\Player($row);
  }

  public static function setupNewGame($players, $options)
  {
    // Create players
    $gameInfos = Game::get()->getGameinfos();
    $colors = $gameInfos['player_colors'];
    $query = self::DB()->multipleInsert([
      'player_id',
      'player_color',
      'player_canal',
      'player_name',
      'player_avatar'
    ]);

    $values = [];
    foreach ($players as $pId => $player) {
      $color = array_shift($colors);

      $values[] = [
        $pId,
        $color,
        $player['player_canal'],
        $player['player_name'],
        $player['player_avatar']
      ];
    }

    $query->values($values);

    Game::get()->reattributeColorsBasedOnPreferences($players, $gameInfos['player_colors']);
    Game::get()->reloadPlayersBasicInfos();
  }

  public static function getActiveId()
  {
    return Game::get()->getActivePlayerId();
  }

  public static function getCurrentId()
  {
    return (int) Game::get()->getCurrentPId();
  }

  public static function getAll(): Collection
  {
    return self::DB()->get(false);
  }

  /*
   * get : returns the Player object for the given player ID
   */
  public static function get($pId = null): Player
  {
    $pId = $pId ?: self::getActiveId();
    return self::DB()
      ->where($pId)
      ->getSingle();
  }

  public static function getActive(): Player
  {
    return self::get();
  }

  public static function getCurrent()
  {
    return self::get(self::getCurrentId());
  }

  public static function getNextId($player = null)
  {
    $player = $player ?? Players::getCurrent();
    $pId = is_int($player) ? $player : $player->getId();
    $table = Game::get()->getNextPlayerTable();
    return $table[$pId];
  }



  /*
   * Return the number of players
   */
  public static function count()
  {
    return self::DB()->count();
  }

  /*
   * getUiData : get all ui data of all players
   */
  public static function getUiData($pId = null)
  {
    return self::getAll()
      ->map(function ($player) use ($pId) {
        return $player->getUiData($pId);
      })
      ->toAssoc();
  }

  /**
   * Get current turn order according to first player variable
   */
  public static function getTurnOrder($firstPlayer = null)
  {
    $firstPlayer = $firstPlayer ?? Globals::getFirstPlayer();
    $order = [];
    $p = $firstPlayer;
    do {
      $order[] = $p;
      $p = self::getNextId($p);
    } while ($p != $firstPlayer);
    return $order;
  }

  /**
   * This allow to change active player
   */
  public static function changeActive($pId)
  {
    Game::get()->gamestate->changeActivePlayer($pId);
  }

  /*
  █████████                               ███     ██████   ███                  
 ███░░░░░███                             ░░░     ███░░███ ░░░                   
░███    ░░░  ████████   ██████   ██████  ████   ░███ ░░░  ████   ██████   █████ 
░░█████████ ░░███░░███ ███░░███ ███░░███░░███  ███████   ░░███  ███░░███ ███░░  
 ░░░░░░░░███ ░███ ░███░███████ ░███ ░░░  ░███ ░░░███░     ░███ ░███ ░░░ ░░█████ 
 ███    ░███ ░███ ░███░███░░░  ░███  ███ ░███   ░███      ░███ ░███  ███ ░░░░███
░░█████████  ░███████ ░░██████ ░░██████  █████  █████     █████░░██████  ██████ 
 ░░░░░░░░░   ░███░░░   ░░░░░░   ░░░░░░  ░░░░░  ░░░░░     ░░░░░  ░░░░░░  ░░░░░░  
             ░███                                                               
             █████                                                              
            ░░░░░                                                               
*/

  /**
   * return a map with number of babysunrose by player id
   */
  public static function getBabySunRoseByPlayer()
  {
    $result = [];
    foreach (static::getAll() as $pId => $player) {
      $result[$pId] = $player->getPlants()->filter(fn($plant) => $plant->getClass() == BABY_SUN_ROSE)->getIds();
    }
    return $result;
  }

  public static function getWaterPossiblePlaces()
  {
    $data = [];
    foreach (static::getAll() as $pId => $player) {
      $data[$pId] = $player->getWaterPossiblePlaces();
    }
    return $data;
  }
  public static function scoreMexican($pId)
  {
    $players = static::getAll();
    $max = 0;
    $nbPlayer = 0;
    foreach ($players as $id => $player) {
      $nb = $player->getPlants()->filter(fn($plant) => $plant->getClass() == MEXICAN_FIRECRACKER)->count();

      if ($id == $pId) {
        $nbPlayer = $nb;
      }

      if ($nb > $max) {
        $max = $nb;
      }
    }
    if ($nbPlayer == 0) return 0; //should not happen
    else if ($nbPlayer == $max) return 5;
    else return 2;
  }
  public static function scoreMermaid($pId)
  {
    $players = static::getAll();
    $nbPlayer = 0;
    $max = 0;
    foreach ($players as $id => $player) {
      $nb = $player->getPlants()->count();

      if ($id == $pId) {
        $nbPlayer = $nb;
      }

      if ($nb > $max) {
        $max = $nb;
      }
    }
    return ($max == $nbPlayer) ? 7 : 0;
  }

  public static function computeScore()
  {
    foreach (static::getAll() as $key => $player) {
      $player->computeScore();
    }
  }
}
