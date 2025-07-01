<?php

namespace LSU\Models;

use LSU\Core\Game;
use LSU\Core\Notifications;
use LSU\Helpers\Utils;
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
        'flowered' => 'flowered',
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
        return $this->getType() == PLANT
            && $this->getPlayerId() != $pId
            && Cards::isAvailable($this->getColor())
            && $this->getTokenNb() > 0
            && !$this->isFlowered();
    }

    public function getLimit()
    {
        if ($this->isPot()) {
            return $this->getMaxWater();
        } else if ($this->getLocation() == PLAYER) {
            if ($this->getClass() == PET_ROCK) {
                return 0;
            }
            $pot = $this->getMatchingCard();
            if ($pot) {
                return $pot->getMaxLeaf() + (($this->getClass() == STRING_OF_PEARLS) ? 6 : 0);
            }
        }
        return 3;
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
    public function incToken($n, $from = null)
    {
        $this->incTokenNb($n);
        if ($this->getTokenNb() < 0) {
            Game::error('You cannot have less than 0 token on a card', $this);
        }

        if ($from) {
            $from->incTokenNb(-$n);
            Notifications::transfert($from, $this, $n);
        } else {
            Notifications::updateCard($this);
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

    public function move($state)
    {
        $this->setState($state);
        Notifications::updateCard($this);
        $this->adjustTokenNb();
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

    public function grow($matchingPot)
    {
        //lose tokens on pot
        $n = $matchingPot->getTokenNb();

        //give equal tokens on plant
        $this->incToken($n, $matchingPot);

        if ($this->getClass() == STRING_OF_DOLPHINS) {
            $this->incToken(2);
        }
    }

    public function discard()
    {
        $this->setLocation(DISCARD);
        Notifications::updateCard($this);
    }

    public function getScore(): array
    {
        [$scoreForPlant, $args] = $this->getScoreForPlant();
        return [$this->getScoreForFlower(), $this->getScoreForLeaves(), $scoreForPlant, $args];
    }

    public function getScoreForPlant(): array
    {
        if ($this->isPot()) return [2, []];
        switch ($this->getClass()) {
            case BABY_TOES:
                return $this->getPlayer()->hasAsManyPlantEachSide();
                break;
            case SNAKE_PLANT:
                return [($this->isAtmax() ? 5 : 0), [$this->getTokenNb(), $this->getLimit()]];
                break;
            case MEXICAN_FIRECRACKER:
                return (Players::scoreMexican($this->getPlayerId()));
                break;
            case JELLYBEAN_PLANT:
                $colors = $this->getPlayer()->getColors();
                return [count($colors), array_map(fn($c) => Notifications::getTranslatableColors($c), $colors)];
                break;
            case CALICO_HEARTS:
                $nbCalicoHeart = $this->getPlayer()
                    ->getPlants()
                    ->filter(fn($plant) => abs($plant->getState()) < abs($this->getState()) && $plant->getState() != 0)
                    ->count();
                return [$nbCalicoHeart, [$nbCalicoHeart]];
                break;
            case BUNNY_EARS:
                return [$this->getTokenNb() % 2 == 0 ? 4 : -1, [$this->getTokenNb()]];
                break;
            case RIBBON_PLANT:
                $nbRibbon = Cards::getInLocation(PLAYER)->filter(fn($card) => $card->getClass() == RIBBON_PLANT)->count();
                return [$nbRibbon, [$nbRibbon]];
                break;
            case LIVING_STONE:
                $nbLivingStone = $this->getPlayer()->getPlants()->filter(fn($card) => $card->getClass() == LIVING_STONE)->count();
                // return [3 * $nbLivingStone, [$nbLivingStone]];
                return [3, []];
                break;

            case ALOE_VERA:
                $nbWater = min(4, $this->getPlayer()->getWater());
                return [$nbWater, [$nbWater]];
                break;
            case MOON_CACTUS:
                return [$this->getPlayer()
                    ->getPlants()
                    ->filter(fn($plant) => !!$plant->getFlowered())
                    ->count() == 0 ? 7 : 0, [$this->getPlayer()
                    ->getPlants()
                    ->filter(fn($plant) => !!$plant->getFlowered())
                    ->count()]];
                break;
            case LEAF_WINDOW:
                $moneyPlant = $this->getPlayer()->getPlant(0);
                return [$moneyPlant->isAtmax() ? 7 : 0, [$moneyPlant->getTokenNb(), $moneyPlant->getLimit()]];
                break;
            case MERMAID_TAIL:
                return Players::scoreMermaid($this->getPlayerId());
                break;
            case PET_ROCK:
                return [5, []];
                break;

            case RAINBOW_WEST:
            case CORAL_CACTUS:
            case BABY_SUN_ROSE:
            case MONEY_PLANT:
            case STRING_OF_PEARLS:
            case STRING_OF_DOLPHINS:
            default:
                return [0, [$this->getTokenNb()]];
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
        return $this->getFlowered() ? 7 : 0;
    }
}
