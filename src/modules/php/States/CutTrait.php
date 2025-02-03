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

trait CutTrait
{
	public function actCut($pId, $args, $stateArgs)
	{
		$cardId = $args['cardId'];
		$state = $args['state'];
		$player = Players::get($pId);

		$cutCard = $stateArgs['cuttableCards'][$cardId] ?? null;
		if (!$cutCard) {
			Game::error("You shouldn't be able to cut this card", $cardId);
		}

		if (!in_array($state, $stateArgs['possiblePlaces'][$cutCard->getType()])) {
			Game::error("You shouldn't be able to place this cut card here", $state);
		}

		//move token leaf on pot
		$pot = $cutCard->getMatchingCard();
		$pot->incToken(1, $cutCard);
		Notifications::message(_('${player_name} cuts a ${cardName} card on ${player_name2}\'s display ${cardLog}'), [
			'player' => $player,
			'player2' => $cutCard->getPlayer(),
			'card' => $cutCard,

		]);


		//move card
		$card = Cards::getCuttedCard($cutCard->getColor());

		$card->setLocation(PLAYER);
		$card->setState($state);
		$card->setPlayerId($pId);
		Notifications::place($card);
		Players::computeScore();

		Game::transition(CONFIRM);
	}
}
