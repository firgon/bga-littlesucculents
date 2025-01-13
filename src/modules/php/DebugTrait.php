<?php

namespace LSU;

use LSU\Core\Globals;
use LSU\Core\Game;
use LSU\Core\Notifications;
use LSU\Managers\Players;
use LSU\Helpers\Log;
use LSU\Managers\Cards;

trait DebugTrait
{
  function debug_undo()
  {
    Log::undoTurn();
  }

  function debug_addTokenAndUpdate(int $i)
  {
    $card = Cards::get($i);
    $card->incTokenNb(1);
    Notifications::updateCard($card);
  }
}
