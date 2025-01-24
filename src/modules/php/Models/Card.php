<?php

namespace LSU\Models;

use LSU\Core\Game;
use LSU\Core\Notifications;
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

    public function getPlayer(): ?Player
    {
        return Players::get($this->getPlayerId());
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
        return $this->getType() == PLANT && $this->getPlayerId() != $pId && Cards::isAvailable($this->getColor()) && $this->getTokenNb() > 0;
    }

    public function getLimit()
    {
        if ($this->isPot()) {
            return $this->getMaxWater();
        } else if ($this->getClass() == PET_ROCK) {
            return 0;
        } else {
            if ($this->getLocation() == PLAYER) {
                $pot = $this->getPlayer()->getPot($this->getState());
                if ($pot) {
                    return $pot->getMaxWater() + (($this->getClass() == STRING_OF_PEARLS) ? 6 : 0);
                }
            }
            return 3;
        }
    }

    public function isAtmax(): bool
    {
        return $this->getLimit() == $this->getTokenNb();
    }

    public function getAvailableSpace()
    {
        return $this->getLimit() - $this->getTokenNb();
    }

    public function getMatchingCard(): ?Card
    {
        $method = $this->isPot() ? "getPlant" : "getPot";
        return $this->getPlayer()->$method($this->getState());
    }

    /**
     * top function to add checks to generic function incTokenNb
     */
    public function incToken($n, $fromId = null)
    {
        $this->setTokenNb($this->getTokenNb() + $n);
        if ($this->getTokenNb() < 0) {
            Game::error('You cannot have less than 0 token on a card', $this);
        }

        if ($fromId) {
            Notifications::transfert($fromId, $this, $n);
        }

        //check if there are not too many tokens
        $this->adjustTokenNb();
        return $this->getTokenNb();
    }

    public function adjustTokenNb()
    {
        $n = $this->getTokenNb() - $this->getLimit();
        if ($n > 0) {
            $this->incTokenNb(-$n);
            Notifications::loseToken($this, $n);
        }
    }

    public function addWater(int $n): int
    {
        if ($this->isPlant()) {
            Game::error("You can't add water to a plant");
        }
        $canAccept = min($this->getAvailableSpace(), $n);
        $this->incTokenNb($canAccept);
        Notifications::updateCard($this);

        return $canAccept;
    }

    public function discard()
    {
        $this->setLocation(DISCARD);
        Notifications::updateCard($this);
    }

    public function getScore(): array
    {
        return [$this->getScoreForFlower(), $this->getScoreForLeaves(), $this->getScoreForPlant()];
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
                return Players::scoreMermaid($this->getPlayerId());
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

    public function getName(): string
    {
        if ($this->isPot()) {
            return match ($this->getColor()) {
                YELLOW => _('yellow pot'),
                GREEN => _('green pot'),
                BLUE => _('blue pot'),
                RED => _('red pot'),
                PINK => _('pink pot'),
                ORANGE => _('orange pot'),
                GREY => _('grey pot'),
                RAINBOW => _('rainbow pot'),
                default => _('pot')
            };
        } else {
            return match ($this->getClass()) {
                BABY_TOES => _('BabyToes'),
                SNAKE_PLANT => _('Snake Plant'),
                MEXICAN_FIRECRACKER => _('Mexican Firecracker'),
                STRING_OF_PEARLS => _('String of Pearls'),
                STRING_OF_DOLPHINS => _('String of Dolphins'),
                JELLYBEAN_PLANT => _('Jellybean Plant'),
                CALICO_HEARTS => _('Calico Hearts'),
                BUNNY_EARS => _('Bunny Ears'),
                RIBBON_PLANT => _('Ribbon Plant'),
                BABY_SUN_ROSE => _('Baby Sun Rose'),
                CORAL_CACTUS => _('Coral Cactus'),
                LIVING_STONE => _('Living Stone'),
                RAINBOW_WEST => _('Rainbow West'),
                ALOE_VERA => _('Aloe Vera'),
                MOON_CACTUS => _('Moon Cactus'),
                LEAF_WINDOW => _('Leaf Window'),
                MERMAID_TAIL => _('Mermaid Tail'),
                PET_ROCK => _('Pet Rock'),
                MONEY_PLANT => _('Money Plant'),
                default => _('plant')
            };
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
                return $this->getTokenNb() ?? 0;
        }
    }

    public function getScoreForFlower(): int
    {
        return $this->getFlowered() == 1 ? 7 : 0;
    }
}
