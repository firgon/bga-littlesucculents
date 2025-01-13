<?php

namespace LSU\States;

use LSU\Core\Globals;
use LSU\Managers\Players;

trait BabySunRoseTrait
{
	public function stBabySunRose()
	{
		$babySunRoseByPlayer = Globals::getBabySunRoseByPlayer();
		$activePlayers = $this->getActivePlayers($babySunRoseByPlayer);
		$this->gamestate->setPlayersMultiactive($activePlayers, END_TURN, true);
	}

	public function argBabySunRose()
	{
		$result = [];
		$babySunRoseByPlayer = Globals::getBabySunRoseByPlayer();

		foreach ($babySunRoseByPlayer as $pId => $babySunRoseIds) {
			$result[$pId] = [
				'n' => count($babySunRoseIds),
				'babySunRoses' => $babySunRoseIds,
				'usableCards' => Players::get($pId)->getPlants()->filter(fn($plant) => $plant->getTokenNb() > 0)->toArray()
			];
		}
		return $result;
	}

	/**
	 * return all playerIds with 0 BabySunRose
	 */
	public function getActivePlayers($babySunRoseByPlayer)
	{
		return array_keys(array_filter($babySunRoseByPlayer, fn($cardIds) => count($cardIds) > 0));
	}
}
