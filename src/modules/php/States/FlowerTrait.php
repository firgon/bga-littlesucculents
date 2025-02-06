<?php

namespace LSU\States;

use LSU\Core\Game;
use LSU\Core\Notifications;
use LSU\Managers\Cards;
use LSU\Managers\Players;

trait FlowerTrait
{
	public function actFlower($pId, $args, $stateArgs)
	{
		$cardId = $args['plantId'];
		$color = $args['color'];
		$player = Players::get($pId);

		$floweredCard = $stateArgs['flowerableCards']['possiblePlants'][$cardId] ?? null;
		if (!$floweredCard) {
			Game::error("You shouldn't be able to flower this card", $cardId);
		}

		if (!in_array($color, $stateArgs['flowerableCards']['possibleColors'][$cardId])) {
			Game::error("You shouldn't be able to place choose this flower", $color);
		}

		//flower this plant

		//move token leaf on pot
		$floweredCard->setFlowered(1);

		Notifications::flower($player, $floweredCard, $color);

		Notifications::updateCard($floweredCard);
		Players::computeScore();

		Game::transition(CONFIRM);
	}
}
