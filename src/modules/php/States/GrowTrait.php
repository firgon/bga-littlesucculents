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
	public function argGrow() {}
}
