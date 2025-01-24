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

	public function stPlay()
	{
		Log::checkpoint();
	}

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

	public function stSeasonEnd()
	{
		$nbCardsOnBoard = Players::count() == 2 ? 2 : 3;
		foreach ([PLANT, POT] as $cardType) {
			$cards = Cards::getInLocationOrdered($cardType . BOARD);
			$index = 1;
			foreach ($cards as $cardId => $card) {
				//add one token to each card still in the market
				$card->incTokenNb(1);
				Notifications::updateCard($card);
				//discard if any had more than limit
				if ($card->getLimit() < $card->getTokenNb()) {
					$card->discard();
					Notifications::updateCard($card);
				}
				//slide cards
				if ($index != $card->getState()) {
					$card->setState($index);
					Notifications::updateCard($card);
				}
				$index++;
			}
			//fill gaps
			for ($i = $index; $i <= $nbCardsOnBoard; $i++) {
				$newCard = Cards::getTopOf("deck" . $cardType);
				$newCard->setLocation($cardType . BOARD);
				$newCard->setState($i);
				Notifications::drawCard($newCard);
			}
		}
		//move next weather card
		$newWeather = Cards::pickOneForLocation(WATER, WATER . BOARD);
		Notifications::updateCard($newWeather);

		//move ladybug
		$nextPlayerId = Globals::changeFirstPlayer();
		Players::changeActive($nextPlayerId);

		//update turn and open Action phase
		Notifications::startActionPhase();
		Log::checkpoint();

		Game::transition();
	}
}
