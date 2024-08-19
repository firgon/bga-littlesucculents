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
    protected $log = true;

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

    /**
     * Can this plant be cuttable by the player in args (you can't cut your own plant)
     * $pid
     */
    public function isCuttable($pId)
    {
        return $this->getType() == PLANT && $this->getPlayerId() != $pId && Cards::isAvailable($this->getColor());
    }

    public function getLeafLimit()
    {
        if ($this->isPot()) {
            return $this->getMaxLeaf();
        } else if ($this->getClass() == PET_ROCK) {
            return 0;
        } else {
            if ($this->getLocation() == PLAYER) {
                $pot = $this->getPlayer()->getPot($this->getState());
                if ($pot) {
                    return $pot->getLeafLimit() + (($this->getClass() == STRING_OF_PEARLS) ? 6 : 0);
                }
            }
            return 0;
        }
    }

    public function getScoreForLeaves(): int
    {

        if ($this->isPot()) return 0;
        switch ($this->getClass()) {
            case MONEY_PLANT:
            case PET_ROCK:
                return 0;
            default:
                return $this->getTokenNb();
        }
    }

    public function getScoreForFlower(): int
    {
        return $this->getFlowered() == 1 ? 7 : 0;
    }

    public function isAtmax(): bool
    {
        return $this->getLeafLimit() == $this->getTokenNb();
    }

    public function getScore(): int
    {
        return $this->getScoreForFlower() + $this->getScoreForLeaves() + $this->getScoreForPlant();
    }

    public function getScoreForPlant(): int
    {
        if ($this->isPot()) return 0;
        switch ($this->getClass()) {
            case BABY_TOES:
                return (($this->getPlayer()->hasAsManyPlantEachSide()) ? 5 : 0);
                break;
            case SNAKE_PLANT:
                return ($this->isAtmax() ? 5 : 0);
                break;
            case MEXICAN_FIRECRACKER:
                return (Players::scoreMexican($this->getPlayerId()));
                break;
            case JELLYBEAN_PLANT:
                return $this->getPlayer()->getColorNb();
                break;
            case CALICO_HEARTS:
                return $this->getPlayer()
                    ->getPlants()
                    ->filter(fn($plant) => abs($plant->getState()) < abs($this->getState()) && $plant->getState() != 0)
                    ->count();
                break;
            case BUNNY_EARS:
                return $this->getTokenNb() % 2 == 0 ? 4 : -1;
                break;
            case RIBBON_PLANT:
                return Cards::getInLocation(PLAYER)->filter(fn($card) => $card->getClass() == RIBBON_PLANT)->count();
                break;
            case LIVING_STONE:
                return 3 * $this->getPlayer()->getPlants()->filter(fn($card) => $card->getClass() == LIVING_STONE)->count();
                break;

            case ALOE_VERA:
                return $this->getPlayer()->getWater();
                break;
            case MOON_CACTUS:
                return $this->getPlayer()
                    ->getPlants()
                    ->filter(fn($plant) => $plant->getFlowered() == 1)
                    ->count() == 0 ? 7 : 0;
                break;
            case LEAF_WINDOW:
                $moneyPlant = $this->getPlayer()->getPlant(0);
                return $moneyPlant->isAtmax() ? 7 : 0;
                break;
            case MERMAID_TAIL:
                return Players::scoreMermaid($this->getId());
                break;
            case PET_ROCK:
                return 5;
                break;

            case RAINBOW_WEST:
            case CORAL_CACTUS:
            case BABY_SUN_ROSE:
            case MONEY_PLANT:
            case STRING_OF_PEARLS:
            case STRING_OF_DOLPHINS:
                return 0;
        }
    }
}
