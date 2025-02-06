<?php

namespace LSU\States;

use COM;
use PDO;
use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Core\Engine;
use LSU\Core\Stats;
use LSU\Managers\Cards;
use LSU\Managers\Players;
use LSU\Models\Player;

trait TendTrait
{
	public function actChooseTend()
	{
		Globals::setPossibleTendActions(['move', 'water']);
		Globals::setRemainingMoves(2);
		Game::transition('chooseTend');
	}

	public function argTend()
	{
		return ['possibleTendActions' => Globals::getPossibleTendActions()];
	}

	public function stTend()
	{
		$possibleTendActions = Globals::getPossibleTendActions();

		//if no action possible => transition to confirm
		//if only one action possible => transition to this action
		if (!$possibleTendActions) {
			Game::transition(CONFIRM);
		} else if (count($possibleTendActions) == 1) {
			Globals::setPossibleTendActions([]);
			Game::transition($possibleTendActions[0]);
		}
	}

	public function actChooseAction($pId, $args, $stateArgs)
	{
		if (!in_array($args['action'], $stateArgs['possibleTendActions'])) {
			Game::error("You can't choose this actions", $args['action']);
		} else {
			$possibleTendActions = $stateArgs['possibleTendActions'];
			array_splice($possibleTendActions, array_search($args['action'], $possibleTendActions), 1);
			Globals::setPossibleTendActions($possibleTendActions);
			Game::transition($args['action']);
		}
	}

	public function argMove()
	{
		$player = Players::getActive();
		$plants = $player->getPlants(false);
		$possiblePlaces = $player->getPossiblePlaces(PLANT);
		$remainingMoves = Globals::getRemainingMoves();
		return  [
			'plants' => $plants->toArray(),
			'possibleEmptyPlaces' => $possiblePlaces,
			'remainingMoves' => $remainingMoves,
			'suffix' => $remainingMoves == 1 ? 'OnlyOne' : ""
		];
	}

	public function stMove()
	{
		if (!$this->getArgs()['plants']) {
			Game::transition();
		}
	}

	public function actMovePlants($pId, $args, $stateArgs)
	{
		$moves = $args['moves'];
		$player = Players::get($pId);
		$moveNb = count(array_keys($moves));

		$remainingMoves = Globals::incRemainingMoves(-$moveNb);

		if ($remainingMoves < 0) {
			Game::error('You can do only 2 moves maximum', $moves);
		}
		foreach ($moves as $cardId => $spaceId) {
			$plant = Cards::get($cardId);
			if (!in_array($plant, $stateArgs['plants'])) {
				Game::error("You shouldn't be able to move this plant", $cardId);
			}
			$plantHere = $player->getPlant($spaceId);
			if ($plantHere) {
				//if moving on not empty space, be sure the plant will move
				if (!array_key_exists($plantHere->getId(), $moves)) {
					Game::error("You can't have 2 plants in the same pot", $spaceId);
				}
			}
			$plant->move($spaceId);
		}
		if ($remainingMoves > 0) {
			Game::transitionSameState();
		} else {
			Game::transition();
		}
	}

	public function actPass()
	{
		Game::transition();
	}
}
