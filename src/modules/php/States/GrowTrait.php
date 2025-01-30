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

trait GrowTrait
{
	public function argWater()
	{
		return [
			'water' => Players::getAll()->map(fn($player) => Cards::getCurrentWeather() + $player->getWater()),
			'possiblePlaces' => Players::getWaterPossiblePlaces(),
			'playerPlans' => Globals::getPlayerPlans()
		];
	}

	public function argWaterSolo()
	{
		$player = Players::getActive();
		return [
			'water' => [$player->getId() => 2 + $player->getWater()],
			'possiblePlaces' => Players::getWaterPossiblePlaces(),
			'playerPlans' => Globals::getPlayerPlans()
		];
	}

	public function stAutomaticWater()
	{
		$notifNeeded = false;
		foreach (Players::getAll() as $pId => $player) {
			foreach ($player->getPlants() as $plantId => $plant) {
				if ($plant->getClass() == CORAL_CACTUS) {
					$notifNeeded = !!$player->getPot($plant->getState())->addWater(1);
				}
			}
		}
		if ($notifNeeded) {
			Notifications::message(_('All Coral Cactus with available place automatically receive an extra water droplet'));
		}

		Game::transition();
	}

	public function actWater($pId, $args, $stateArgs)
	{
		$cards = $args['cardIds'];
		$possiblePlaces = $stateArgs['possiblePlaces'][$pId];
		$water = $stateArgs['water'][$pId];

		if ($water < count($cards)) {
			Game::error("You can\'t place more than $water water droplets", count($cards));
		}


		for ($i = 0; $i < $water; $i++) {
			if (isset($cards[$i])) {
				$possiblePlaces[$cards[$i]]--;
				if ($possiblePlaces[$cards[$i]] < 0) {
					Game::error("You can't place so many water droplets on this card", $cards[$i]);
				}
			}
		}

		Globals::addPlayerPlan($pId, $cards);
	}

	public function actChangeMind($pId, $args, $stateArgs)
	{
		Globals::addPlayerPlan($pId);
		Notifications::message(_('${player_name} changes mind'), ['player' => Players::get($pId)]);
	}

	public function stRegisterWater()
	{
		$currentWeather = Cards::getCurrentWeather();
		$playerPlans = Globals::getPlayerPlans();

		foreach ($playerPlans as $playerId => $cardIds) {
			$remainingWater = $currentWeather - count($cardIds);
			$player = Players::get($playerId);
			$player->incWater($remainingWater);

			foreach ($cardIds as $cardId) {
				$card = Cards::get($cardId);
				$card->addWater(1);
			}
		}
		//reset playerPlans
		Globals::setPlayerPlans([]);

		//prepare for next phase
		//determine babysunroseplayer
		$babySunRoseByPlayer = Players::getBabySunRoseByPlayer();
		Globals::setBabySunRoseByPlayer($babySunRoseByPlayer);
		Game::activeAll();

		Game::transition();
	}


	public function actWaterSolo($pId, $args, $stateArgs)
	{
		$cards = $args['cardIds'];
		$possiblePlaces = $stateArgs['possiblePlaces'][$pId];
		$water = $stateArgs['water'][$pId] ?? 0;

		if ($water < count($cards)) {
			Game::error("You can\'t place more than $water water droplets", count($cards));
		}
		for ($i = 0; $i < $water; $i++) {
			if (isset($cards[$i])) {
				$possiblePlaces[$cards[$i]]--;
				if ($possiblePlaces[$cards[$i]] < 0) {
					Game::error("You can't place so many water droplets on this card", $cards[$i]);
				}
			}
		}

		foreach ($cards as $cardId) {
			$card = Cards::get($cardId);
			$card->addWater(1);
		}
		Game::transition();
	}

	public function stGrow()
	{
		foreach (Players::getAll() as $pId => $player) {
			$player->grow();
		}
		Game::transition(END_TURN);
	}

	public function stGrowSolo()
	{
		Players::getActive()->grow();

		Game::transition(END_TURN);
	}
}
