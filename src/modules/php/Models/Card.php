<?php

namespace LSU\Models;

use LSU\Managers\Cards;
use LSU\Managers\Players;

/*
 * Card
 */

class Card extends \LSU\Helpers\DB_Model
{
    protected $table = 'cards';
    protected $primary = 'card_id';
    protected $attributes = [
        'id' => ['card_id', 'int'],
        'location' => 'card_location',
        'state' => ['card_state', 'int'],
        'extraDatas' => ['extra_datas', 'obj'],
        'playerId' => ['player_id', 'int'],
        'dataId' => ['data_id', 'int'],
        'tokenNb' => ['token_nb', 'int'],
        'flowered' => ['flowered', 'int'],
    ];

    protected $staticAttributes = [
        'type',
        ['maxLeaf', 'int'],
        ['maxWater', 'int'],
        'color',
        'class',
        'name'
    ];

    public function __construct($row, $datas)
    {
        parent::__construct($row);
        foreach ($datas as $attribute => $value) {
            $this->$attribute = $value;
        }
    }

    public function isPlant()
    {
        return $this->getType() == PLANT;
    }

    public function isPot()
    {
        return $this->getType() == POT;
    }

    public function isCuttable($pId)
    {
        return $this->getType() == PLANT && $this->getPlayerId() != $pId && Cards::isAvailable($this->getColor());
    }
}
