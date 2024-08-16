<?php

namespace LSU\States;

use PDO;
use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Core\Engine;
use LSU\Core\Stats;
use LSU\Helpers\Log;
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

	public function actUndo($pId, $args, $stateArgs)
	{
		Log::undoTurn();
		Game::transition(UNDO);
	}
	public function actConfirm($pId, $args, $stateArgs)
	{
		Log::checkpoint();
		Game::transition(END_TURN);
	}
}
