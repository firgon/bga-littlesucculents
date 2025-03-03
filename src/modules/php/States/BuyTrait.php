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

trait BuyTrait
{
	public function actBuy($pId, $args, $stateArgs)
	{
		$cardId = $args['cardId'];
		$state = $args['state'];
		$player = Players::get($pId);

		$card = $stateArgs['buyableCards'][$cardId] ?? null;
		if (!$card) {
			Game::error("You shouldn't be able to buy this card", $cardId);
		}

		if (!in_array($state, $stateArgs['possiblePlaces'][$card->getType()])) {
			Game::error("You shouldn't be able to place this card here", $state);
		}

		//player pay (loose leaf on money plant)
		$player->pay($card->getState());
		Notifications::pay($player, $card->getState(), $card);

		//if card is a pot => automatically move the basic pot
		if ($card->isPot()) {
			$movement = $state > 0 ? 1 : -1;
			$potToMove = Players::getActive()->getPot($state);
			if ($potToMove) {
				$potToMove->move($state + $movement);
			}
		}

		//move card
		$card->setLocation(PLAYER);
		$card->setState($state);
		$card->setPlayerId($pId);
		Notifications::place($card);
		Players::computeScore();

		//adjust tokens (loose leaf if there are too many)
		$card->adjustTokenNb();



		Game::transition(CONFIRM);
	}
}
