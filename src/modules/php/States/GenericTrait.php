<?php

namespace LSU\States;

use PDO;
use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Core\Engine;
use LSU\Core\Stats;
use LSU\Managers\Cards;
use LSU\Managers\Players;
use LSU\Models\Player;

trait GenericTrait
{

	public function stNextPlayer()
	{
		$activePlayer = Players::getActive();

		die($activePlayer);

		if ($activePlayer) {
			$nextState = $activePlayer->getNextPendingAction();
			if ($nextState) {
				Game::goTo($nextState);
			} else {
				//TODO add check end game
				if (true) {
					$this->activeNextPlayer();
					$this->giveExtraTime(Players::getActiveId());
					Game::transition(END_TURN);
				} else {
					Game::transition(END_GAME);
				}
			}
		}
	}

	public function actGenericAction($args)
	{
		if (!$args['actionName']) {
			var_dump($args);
			throw new \BgaVisibleSystemException("You can't use genericAction without correct args. Should not happen");
		}
		if (!method_exists($this, $args['actionName'])) {
			var_dump($args);
			throw new \BgaVisibleSystemException("Unimplemented method action. Should not happen");
		}
		if (!isset($args['notActive'])) {
			Game::checkAction($actionName = $args['actionName']);
		} else {
			Game::isPossibleAction($actionName = $args['actionName']);
		}

		$pId = Game::get()->getCurrentPlayerId();

		$this->$actionName($pId, $args, $this->getArgs());
	}
}
