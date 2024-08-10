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

trait TurnTrait
{
	public function argPlay()
	{
		//possible actions  
		// buy a card, 
		// cut another player plant, 
		// flower his succulent or 
		// tend to his plants
		$player = Players::getActive();
		$possiblePotPlaces = $player->getPossiblePlaces(POT);
		$possiblePlantPlaces = $player->getPossiblePlaces(PLANT);
		$buyableCards = Cards::getBuyableCards($player);
		$cuttableCards = Cards::getCuttableCards($player);
		$flowerableCards = Cards::getFlowerableCards($player);

		return [
			"buyableCards" => $buyableCards,
			"cuttableCards" => $cuttableCards,
			"flowerableCards" => $flowerableCards,
			"possiblePlaces" => [
				PLANT => $possiblePlantPlaces,
				POT => $possiblePotPlaces,
			]
		];
	}

	public function stPlay() {}

	public function actPlay($pId2, $color, $value, $pId = null)
	{
		// get infos
		if (!$pId) {
			$pId = Game::get()->getCurrentPlayerId();
			self::checkAction('actPlay');
		}

		$currentPlayer = Players::get($pId);
		$calledPlayer = Players::get($pId2);

		$args = $this->getArgs();

		if (!in_array($calledPlayer, $args['callablePlayers'])) {
			throw new \BgaVisibleSystemException("You can't call this player.");
		}

		foreach ($args['uncallableCards'] as $id => $card) {
			if ($card->getColor() == $color && $card->getValue() == $value)
				throw new \BgaVisibleSystemException("You can't ask this card.");
		}

		Notifications::call($currentPlayer, $calledPlayer, $color, $value);

		Globals::setCalledPlayer($pId2);
		Globals::setCalledValue($value);
		Globals::setCalledColor($color);


		$this->gamestate->nextState('');
	}
}
