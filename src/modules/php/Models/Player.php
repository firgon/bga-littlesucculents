<?php

namespace LSU\Models;

use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Core\Stats;
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

  public function computeScore()
  {
    $registeredScore = $this->getScore();
    $score = 0;
    $scoreDetail = [];
    foreach ($this->getPlants() as $plantId => $plant) {
      $plantScore = $plant->getScore();
      $scoreDetail[$plantId] = $plantScore;
      $score += array_sum($plantScore);
    }
    $this->setScore($score);
    if ($registeredScore != $score) {
      Notifications::newScore($this, $scoreDetail);
    }
    return $score;
  }

  public function getMoney()
  {
    return $this->getPlant(0)->getTokenNb();
  }

  public function getPlant($state)
  {
    return Cards::getInLocationPId(PLAYER, $this->getId(), $state)->filter(fn($card) => $card->isPlant())->first();
  }

  public function getPlants($bIncludingMoney = true)
  {
    return Cards::getInLocationPId(PLAYER, $this->getId())->filter(fn($card) => $card->isPlant() && ($bIncludingMoney || $card->getState() != 0));
  }

  public function getPots()
  {
    return Cards::getInLocationPId(PLAYER, $this->getId())->filter(fn($card) => $card->isPot());
  }

  public function getPot($state)
  {
    return Cards::getInLocationPId(PLAYER, $this->getId(), $state)->filter(fn($card) => $card->isPot())->first();
  }

  //check each pot to see if it must grow or not
  public function grow()
  {
    $pots = $this->getPots();
    foreach ($pots as $potId => $pot) {
      $plant = $pot->getMatchingCard();
      if ($pot->isAtmax() && $plant && !$plant->getFlowered()) {
        $plant->grow($pot);
      }
    }
  }

  public function hasFreePot(): bool
  {
    foreach ($this->getPots() as $key => $pot) {
      if (!$this->getMatchingPlant($pot)) return true;
    }
    return false;
  }

  public function hasAsManyPlantEachSide()
  {
    $plants = $this->getPlants();

    $plantLeft = $plants->filter(fn($plant) => $plant->getState() < 0);
    $plantRight = $plants->filter(fn($plant) => $plant->getState() > 0);

    return $plantLeft->count() == $plantRight->count();
  }

  public function getColorNb()
  {
    $validatedColors = [];
    foreach ($this->getPlants() as $key => $plant) {
      $color = $plant->getColor();
      if (in_array($color, ALL_COLORS)) $validatedColors[$color] = true;
    }
    foreach ($this->getPots() as $key => $pot) {
      $color = $pot->getColor();
      if (in_array($color, ALL_COLORS)) $validatedColors[$color] = true;
    }
    return count(array_keys($validatedColors));
  }

  public function getWaterPossiblePlaces()
  {
    $result = [];
    $pots = $this->getPots();
    foreach ($pots as $cardId => $pot) {
      $plant = $this->getMatchingPlant($pot);
      if ($plant && $plant->isFlowered()) continue;
      $result[$cardId] = $pot->getAvailableSpace();
    }
    return $result;
  }

  //get available place for a plant or for a pot
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
