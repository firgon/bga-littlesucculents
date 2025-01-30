<?php

namespace LSU\Core;

use LSU\Core\Game;
use LSU\Managers\Players;

/*
 * Globals
 */

class Globals extends \LSU\Helpers\DB_Manager
{
  protected static $initialized = false;
  protected static $variables = [
    'turn' => 'int',
    'firstPlayer' => 'int',
    'lastPlacedCard' => 'int',
    'cheatMode' => 'bool',
    'playerPlans' => 'obj',
    'babySunRoseByPlayer' => 'obj',
    'possibleTendActions' => 'obj'
    // 'calledValue' => 'int',
    // 'calledColor' => 'str',
    // 'calledPlayer' => 'int'
  ];

  protected static $table = 'global_variables';
  protected static $primary = 'name';
  protected static function cast($row)
  {
    $val = json_decode(\stripslashes($row['value']), true);
    return self::$variables[$row['name']] == 'int' ? ((int) $val) : $val;
  }

  public static function setupNewGame($players, $options, $activePlayerId)
  {
    static::setTurn(0);
    static::setFirstPlayer($activePlayerId);
    // static::setCheatMode(Game::isStudio());
  }

  public static function changeFirstPlayer()
  {
    $firstPlayer = static::getFirstPlayer();
    $nextFirstPlayer = Players::getNextId($firstPlayer);
    static::setFirstPlayer($nextFirstPlayer);
    Notifications::updatePlayers();
    return $nextFirstPlayer;
  }

  public static function addPlayerPlan($pId, $cards = null)
  {
    // Compute players that still need to select their card
    // => use that instead of BGA framework feature because in some rare case a player
    //    might become inactive eventhough the selection failed (seen in Agricola at least already)
    $playerPlans = static::getPlayerPlans();

    if (is_null($cards)) {
      unset($playerPlans[$pId]);
    } else {
      $playerPlans[$pId] = $cards;
      Notifications::playerReady($pId);
    }
    static::setPlayerPlans($playerPlans);
    $playerIds = Players::getAll()->filter(fn($player) => !$player->getZombie())->getIds();
    $ids = array_diff($playerIds, array_keys($playerPlans));

    // At least one player need to make a choice
    if (!empty($ids)) {
      Game::get()->gamestate->setPlayersMultiactive($ids, END_TURN, true);
    }
    // Everyone is done => go to next state
    else {
      Game::get()->gamestate->nextState(END_TURN);
    }
  }

  /*
   * Fetch all existings variables from DB
   */
  protected static $data = [];
  public static function fetch()
  {
    // Turn of LOG to avoid infinite loop (Globals::isLogging() calling itself for fetching)
    $tmp = self::$log;
    self::$log = false;

    foreach (
      self::DB()
        ->select(['value', 'name'])
        ->get(false)
      as $name => $variable
    ) {
      if (\array_key_exists($name, self::$variables)) {
        self::$data[$name] = $variable;
      }
    }
    self::$initialized = true;
    self::$log = $tmp;
  }

  /*
   * Create and store a global variable declared in this file but not present in DB yet
   *  (only happens when adding globals while a game is running)
   */
  public static function create($name)
  {
    if (!\array_key_exists($name, self::$variables)) {
      return;
    }

    $default = [
      'int' => 0,
      'obj' => [],
      'bool' => false,
      'str' => '',
    ];
    $val = $default[self::$variables[$name]];
    self::DB()->insert(
      [
        'name' => $name,
        'value' => \json_encode($val),
      ],
      true
    );
    self::$data[$name] = $val;
  }

  /*
   * Magic method that intercept not defined static method and do the appropriate stuff
   */
  public static function __callStatic($method, $args)
  {
    if (!self::$initialized) {
      self::fetch();
    }

    if (preg_match('/^([gs]et|inc|is)([A-Z])(.*)$/', $method, $match)) {
      // Sanity check : does the name correspond to a declared variable ?
      $name = strtolower($match[2]) . $match[3];
      if (!\array_key_exists($name, self::$variables)) {
        throw new \InvalidArgumentException("Property {$name} doesn't exist");
      }

      // Create in DB if don't exist yet
      if (!\array_key_exists($name, self::$data)) {
        self::create($name);
      }

      if ($match[1] == 'get') {
        // Basic getters
        return self::$data[$name];
      } elseif ($match[1] == 'is') {
        // Boolean getter
        if (self::$variables[$name] != 'bool') {
          throw new \InvalidArgumentException("Property {$name} is not of type bool");
        }
        return (bool) self::$data[$name];
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        $value = $args[0];
        if (self::$variables[$name] == 'int') {
          $value = (int) $value;
        }
        if (self::$variables[$name] == 'bool') {
          $value = (bool) $value;
        }

        self::$data[$name] = $value;
        self::DB()->update(['value' => \addslashes(\json_encode($value))], $name);
        return $value;
      } elseif ($match[1] == 'inc') {
        if (self::$variables[$name] != 'int') {
          throw new \InvalidArgumentException("Trying to increase {$name} which is not an int");
        }

        $getter = 'get' . $match[2] . $match[3];
        $setter = 'set' . $match[2] . $match[3];
        return self::$setter(self::$getter() + (empty($args) ? 1 : $args[0]));
      }
    }
    return undefined;
  }
}
