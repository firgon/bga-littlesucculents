<?php

namespace LSU\Core;

use LittleSucculents;

/*
 * Game: a wrapper over table object to allow more generic modules
 */

class Game
{
  public static function get()
  {
    return LittleSucculents::get();
  }
  
  public static function isStudio(): bool
  {
    return static::get()->getBgaEnvironment() == 'studio';
  }

  public static function isMultiactiveState()
  {
    return static::get()->gamestate->isMutiactiveState();
  }

  public static function getActivePlayerList()
  {
    return static::get()->gamestate->getActivePlayerList();
  }

  public static function activeAll()
  {
    static::get()->gamestate->setAllPlayersMultiactive();
  }

  public static function transitionSameState()
  {
    static::goTo(static::get()->gamestate->state_id());
  }

  public static function error($str, $data = "")
  {
    throw new \BgaVisibleSystemException(
      $str . ". Should not happen : " . var_dump($data)
    );
  }

  public static function isStateId($stateId)
  {
    return static::get()->gamestate->state_id() == $stateId;
  }


  public static function transition($transition)
  {
    static::get()->gamestate->nextState($transition);
  }

  public static function goTo($nextState)
  {
    static::get()->gamestate->jumpToState($nextState);
  }

  /**
   * check if the action is one of the possible actions in this state
   */
  public static function isPossibleAction($action)
  {
    static::get()->gamestate->checkPossibleAction($action);
  }

  /**
   * check if the current player is active and can perform this action
   */
  public static function checkAction($action)
  {
    static::get()->checkAction($action);
  }
}
