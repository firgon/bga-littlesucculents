<?php

namespace LSU\States;

use LSU\Core\Game;
use LSU\Core\Globals;
use LSU\Core\Notifications;
use LSU\Helpers\Utils;
use LSU\Managers\Cards;
use LSU\Managers\Players;

trait BabySunRoseTrait
{
	public function argBabySunRose()
	{
		$result = [];

		foreach ($this->gamestate->getActivePlayerList() as $pId) {
			$plants = Players::get($pId)->getPlants();
			$result[$pId] = [
				'babySunRoses' => $plants->filter(fn($plant) => $plant->getClass() == BABY_SUN_ROSE && !$plant->isAtmax()),
				'usableCards' => $plants->filter(fn($plant) => $plant->getTokenNb() > 0)
			];
		}
		return $result;
	}

	public function actBabySunRose($pId, $args, $stateArgs)
	{
		$toIds = $args["toIds"];
		$fromIds = $args["fromIds"];

		if (count($toIds) != count($fromIds)) {
			Game::error("You shouldn't be able to make such a choice", $args);
		}

		for ($i = 0; $i < count($toIds); $i++) {
			$fromCard = $stateArgs[$pId]['usableCards'][$fromIds[$i]] ?? null;
			$toCard = $stateArgs[$pId]['babySunRoses'][$toIds[$i]] ?? null;

			if (!$toCard) {
				// Utils::die($toIds[$i]);
				Game::error("You can't place a leaf on this baby sun rose", $args);
			}

			if (!$fromCard) {
				Game::error("You can't take a leaf on this card", $args);
			}

			$toCard->incToken(1, $fromCard);
		}

		$this->gamestate->setPlayerNonMultiactive($pId, END_TURN);
	}

	public function actDeny()
	{
		$player = Players::getCurrent();
		Notifications::message(clienttranslate('${player_name} declines the Baby Sun Rose effect.'), [
			'player' => $player
		]);
		$this->gamestate->setPlayerNonMultiactive($player->getId(), END_TURN);
	}
}
