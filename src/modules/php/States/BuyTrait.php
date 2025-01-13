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

		//move card
		$card->setLocation(PLAYER);
		$card->setState($state);
		$card->setPlayerId($pId);
		Notifications::place($card);

		//adjust tokens (loose leaf if there are too many)
		$card->adjustTokenNb();

		Globals::setLastPlacedCard($cardId);

		//if card is a pot => automatically move the plant on the neutral pot on it
		if ($card->isPot()) {
			$plantState = $state > 0 ? 1 : -1;
			$plantToMove = Players::getActive()->getPlant($plantState);
			$plantToMove->setState($state);
			Notifications::updateCard($plantToMove);
		}

		Game::transition(CONFIRM);
	}

	// public function argMovePlant()
	// {
	// 	$cardId = Globals::getLastPlacedCard();
	// 	$card = Cards::get($cardId);

	// 	$cardState = $card->getState();

	// 	$plantState = $cardState > 0 ? 1 : -1;

	// 	return [
	// 		"plant" => Players::getActive()->getPlant($plantState),
	// 		"place" => $cardState
	// 	];
	// }

	// public function stMovePlant()
	// {
	// 	if (!$this->getArgs()['plant']) {
	// 		$transition = Players::getActive()->hasPref(PREF_CONFIRM, PREF_CONFIRM_NO) ? END_TURN : CONFIRM;
	// 		Game::transition($transition);
	// 	}
	// }
}
