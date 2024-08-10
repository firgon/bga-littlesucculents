<?php

namespace LSU\Models;

use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Core\Stats;
use LSU\Core\Preferences;
use LSU\Managers\Players;
use LSU\Managers\Cards;
use LSU\Managers\Cells;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \LSU\Helpers\DB_Model
{
  private $map = null;
  protected $table = 'player';
  protected $primary = 'player_id';
  protected $attributes = [
    'id' => ['player_id', 'int'],
    'no' => ['player_no', 'int'],
    'name' => 'player_name',
    'color' => 'player_color',
    'eliminated' => 'player_eliminated',
    'score' => ['player_score', 'int'],
    'scoreAux' => ['player_score_aux', 'int'],
    'canUndo' => ['player_can_undo', 'int'],
    'pendingActions' => ['player_pending_actions', 'obj'],
    'zombie' => 'player_zombie',
    'water' => ['player_water', 'int']
  ];

  public $bindedAttributes = [];

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $data['money'] = $this->getMoney();
    $data['isFirst'] = Globals::getFirstPlayer() == $this->getId();

    return $data;
  }

  public function getMoney()
  {
    return $this->getPlant(0)->getTokenNb();
  }

  public function getPlant($state)
  {
    return Cards::getInLocationPId(PLAYER, $this->getId(), $state)->filter(fn($card) => $card->isPlant())->first();
  }

  public function getPots()
  {
    return Cards::getInLocationPId(PLAYER, $this->getId())->filter(fn($card) => $card->isPot());
  }

  public function getPot($state)
  {
    return Cards::getInLocationPId(PLAYER, $this->getId(), $state)->filter(fn($card) => $card->isPot())->first();
  }

  public function getPossiblePlaces($type)
  {
    $min = 0;
    $max = 0;
    if ($type == POT) {
      $pots = $this->getPots();
      foreach ($pots as $key => $pot) {
        $min = min($min, $pot->getState());
        $max = max($max, $pot->getState());
      }
      return [$min - 1, $max + 1];
    } else {
      $result = [];
      $pots = $this->getPots();
      foreach ($pots as $key => $pot) {
        $plant = $this->getMatchingPlant($pot);
        if (!$plant) {
          $result[] = $pot->getState();
        }
      }
      return $result;
    }
  }

  public function getMatchingPlant(Card $pot)
  {
    return $this->getPlant($pot->getState());
  }

  public function pay($n)
  {
    $moneyPlant = $this->getPlant(0);
    $remaining = $moneyPlant->incTokenNb(-$n);
    if ($remaining < 0) {
      Game::error('You should not be able to pay more than money you have');
    }
    Notifications::pay($this, $n);
  }

  /*
     █████████                                          ███                  
    ███░░░░░███                                        ░░░                   
   ███     ░░░   ██████  ████████    ██████  ████████  ████   ██████   █████ 
  ░███          ███░░███░░███░░███  ███░░███░░███░░███░░███  ███░░███ ███░░  
  ░███    █████░███████  ░███ ░███ ░███████  ░███ ░░░  ░███ ░███ ░░░ ░░█████ 
  ░░███  ░░███ ░███░░░   ░███ ░███ ░███░░░   ░███      ░███ ░███  ███ ░░░░███
   ░░█████████ ░░██████  ████ █████░░██████  █████     █████░░██████  ██████ 
    ░░░░░░░░░   ░░░░░░  ░░░░ ░░░░░  ░░░░░░  ░░░░░     ░░░░░  ░░░░░░  ░░░░░░  
                                                                             
                                                                             
                                                                             
  */

  public function addActionToPendingAction($action, $bFirst = false)
  {
    // $player = is_numeric($player) ? Players::get($player) : $player;
    $pendingActions = $this->getPendingActions();

    if ($bFirst) {
      array_unshift($pendingActions, $action);
    } else {
      array_push($pendingActions, $action);
    }

    $this->setPendingActions($pendingActions);
  }

  public function getNextPendingAction($bFirst = true, $bDestructive = true)
  {

    $pendingActions = $this->getPendingActions();

    if ($bFirst) {
      $action = array_shift($pendingActions);
    } else {
      $action = array_pop($pendingActions);
    }

    if ($bDestructive) {
      $this->setPendingActions($pendingActions);
    }
    return $action;
  }

  public function getPref($prefId): ?int
  {
    return Game::get()->getGameUserPreference($this->getId(), $prefId);
  }

  public function hasPref($prefId, $value): bool
  {
    return $this->getPref($prefId) == $value;
  }

  public function getStat($name)
  {
    $name = 'get' . \ucfirst($name);
    return Stats::$name($this->id);
  }
}
