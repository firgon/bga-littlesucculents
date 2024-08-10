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

		//adjust tokens (loose leaf if there are too many)

		$transition = $player->hasPref(PREF_CONFIRM, PREF_CONFIRM_NO) ? END_TURN : CONFIRM;

		Game::transition($transition);
	}
}
