<?php

namespace LSU\Managers;

use LSU\Helpers\Utils;
use LSU\Helpers\Collection;
use LSU\Core\Notifications;
use LSU\Core\Stats;
use LSU\Models\Player;

/* Class to manage all the Cards for Col */

class Cards extends \LSU\Helpers\Pieces
{
    protected static $table = 'cards';
    protected static $prefix = 'card_';
    protected static $autoIncrement = true;
    protected static $autoremovePrefix = false;
    protected static $customFields = ['extra_datas', 'player_id', 'token_nb', 'data_id', 'flowered'];

    protected static $autoreshuffle = true; // If true, a new deck is automatically formed with a reshuffled discard as soon at is needed
    // If defined, tell the name of the deck and what is the corresponding discard (ex : "mydeck" => "mydiscard")
    protected static $autoreshuffleCustom = [DECK_POT => DISCARD . POT, DECK_PLANT => DISCARD . PLANT];

    protected static function cast($row)
    {
        $data = self::getCards()[$row['data_id']];
        return new \LSU\Models\Card($row, $data);
    }

    public static function getUiData()
    {
        return [
            DECK_POT => static::countInLocation(DECK_POT),
            DECK_PLANT => static::countInLocation(DECK_PLANT),
            BOARD => static::getInLocation(BOARD)->toArray(),
            PLAYER => static::getInLocation(PLAYER)->toArray(),
            DISCARD . POT => [
                'n' => static::countInLocation(DISCARD . POT),
                'topCard' => static::getTopOf(DISCARD . POT)
            ],
            DISCARD . PLANT => [
                'n' => static::countInLocation(DISCARD . PLANT),
                'topCard' => static::getTopOf(DISCARD . PLANT)
            ],
            WATER => [
                'n' => static::countInLocation(WATER),
                'topCard' => static::getTopOf(WATER)
            ],
            WATER . BOARD => static::getInLocation(WATER . BOARD)->first(),
            VISIBLE_DECK => static::getInLocation(VISIBLE_DECK)->toArray(),
            "flowerableColors" => static::getFlowerableColors(),
        ];
    }

    public static function getBuyableCards(Player $player)
    {
        return static::getInLocation(BOARD)->filter(fn($card) => $card->getState() <= $player->getMoney());
    }

    public static function getCuttableCards(Player $player)
    {
        return static::getInLocation(PLAYER)->filter(
            fn($card) =>
            $card->isCuttable($player->getId())
        );
    }

    public static function getFlowerableColors()
    {
        $cards = self::getInLocationQ(PLAYER)
            ->where('flowered', FLOWERED)
            ->get();
        return array_diff(ALL_COLORS, $cards->map(fn($card) => $card->getColor())->toArray());
    }

    public static function getFlowerableCards(Player $player)
    {
        $flowerableColors = static::getFlowerableColors();
        $possibleFlowers = [];
        foreach ($player->getPots() as $key => $pot) {
            $potColor = $pot->getColor();
            if ($potColor == RAINBOW || in_array($potColor, $flowerableColors)) {
                $plant = $player->getMatchingPlant($pot);
                if ($plant) {
                    $plantColor = $plant->getColor();
                    if ($plantColor == RAINBOW) {
                        $possibleFlowers[$plant->getId()] = $flowerableColors;
                    } else if ($plantColor == $potColor) {
                        $possibleFlowers[$plant->getId()] = [$plantColor];
                    }
                }
            }
        }
        return $possibleFlowers;
    }

    //a card can be cutted only if there is at least one card of this color remaining in the visible deck
    public static function isAvailable($color)
    {
        return static::getInLocation(VISIBLE_DECK)->filter(fn($card) => $card->getColor() == $color)->count() > 0;
    }

    /* Creation of the Cards */
    public static function setupNewGame($players, $options)
    {
        $cards = [];
        // Create the deck
        foreach (self::getCards() as $dataId => $card) {
            for ($i = 0; $i < $card['nb']; $i++) {
                $cards[] = [
                    'location' => $card['deck'],
                    'data_id' => $dataId,
                ];
            }
        }

        shuffle($cards);

        static::create($cards);

        $index = 0;
        $tokenNB = [2, 2, 3, 3];

        foreach ($players as $pId => $player) {
            $plant0 = static::getTopOf(STARTER . PLANT);
            $plant0->setLocation(PLAYER);
            $plant0->setPlayerId($pId);
            $plant0->setTokenNb($tokenNB[$index++]);
            $plant0->setState(0);

            $pot0 = static::getTopOf(STARTER . POT);
            $pot0->setLocation(PLAYER);
            $pot0->setPlayerId($pId);
            $pot0->setState(0);

            foreach ([-1, 1] as $i) {
                $pot = static::getTopOf(STARTER);
                $pot->setLocation(PLAYER);
                $pot->setPlayerId($pId);
                $pot->setState($i);
            }
        }

        $nbColorCards = [
            2 => 1,
            3 => 2,
            4 => 3
        ];
        $nbSpecialCards = [
            2 => 3,
            3 => 4,
            4 => 6
        ];
        $nbPlayers = count(array_keys($players));
        //discard unused
        static::pickForLocation(6 - $nbSpecialCards[$nbPlayers], DECK_PLANT, BOX);

        foreach (ALL_COLORS as $color) {
            $decks = [SET_A, SET_B];
            $option = $options[OPTION_PLANT_SET] == OPTION_PLANT_RANDOM_SET
                ? bga_rand(0, 1)
                : $options[OPTION_PLANT_SET];

            //add some card from set into deck
            $cards = static::pickForLocation($nbColorCards[$nbPlayers], $decks[$option] . $color, DECK_PLANT);
            //put all other cards into visible deck
            static::moveAllInLocation($decks[$option] . $color, VISIBLE_DECK);
        }
        static::shuffle(DECK_PLANT);
        static::shuffle(DECK_POT);

        $nbCardsOnBoard = $nbPlayers == 2 ? 2 : 3;

        for ($i = 1; $i <= $nbCardsOnBoard; $i++) {
            $plant = static::getTopOf(DECK_PLANT);
            $plant->setTokenNb(1);
            $plant->setLocation(BOARD);
            $plant->setState($i);
            $pot = static::getTopOf(DECK_POT);
            $pot->setTokenNb(1);
            $pot->setLocation(BOARD);
            $pot->setState($i);
        }

        static::shuffle(WATER);
        static::pickForLocation(1, WATER, WATER . BOARD);
    }

    public static function getCards()
    {
        $littlesucculents_f = function ($data) {
            return [
                'type' => $data[0],
                'maxLeaf' => $data[1],
                'maxWater' => $data[2],
                'nb' => $data[3],
                'color' => $data[4],
                'deck' => $data[5],
                'class' => $data[6],
                'name' => $data[7],
            ];
        };

        return [
            1 => $littlesucculents_f([POT, 2, 1, 8, GREY, STARTER, 'Pot', 'Pot']),
            2 => $littlesucculents_f([POT, 6, 2, 1, PINK, DECK_POT, 'Pot', 'Pot']),
            3 => $littlesucculents_f([POT, 8, 3, 1, PINK, DECK_POT, 'Pot', 'Pot']),
            4 => $littlesucculents_f([POT, 12, 4, 1, PINK, DECK_POT, 'Pot', 'Pot']),
            5 => $littlesucculents_f([POT, 6, 2, 1, ORANGE, DECK_POT, 'Pot', 'Pot']),
            6 => $littlesucculents_f([POT, 8, 3, 1, ORANGE, DECK_POT, 'Pot', 'Pot']),
            7 => $littlesucculents_f([POT, 12, 4, 1, ORANGE, DECK_POT, 'Pot', 'Pot']),
            8 => $littlesucculents_f([POT, 6, 2, 1, YELLOW, DECK_POT, 'Pot', 'Pot']),
            9 => $littlesucculents_f([POT, 8, 3, 1, YELLOW, DECK_POT, 'Pot', 'Pot']),
            10 => $littlesucculents_f([POT, 12, 4, 1, YELLOW, DECK_POT, 'Pot', 'Pot']),
            11 => $littlesucculents_f([POT, 6, 2, 1, GREEN, DECK_POT, 'Pot', 'Pot']),
            12 => $littlesucculents_f([POT, 8, 3, 1, GREEN, DECK_POT, 'Pot', 'Pot']),
            13 => $littlesucculents_f([POT, 12, 4, 1, GREEN, DECK_POT, 'Pot', 'Pot']),
            14 => $littlesucculents_f([POT, 6, 2, 1, BLUE, DECK_POT, 'Pot', 'Pot']),
            15 => $littlesucculents_f([POT, 8, 3, 1, BLUE, DECK_POT, 'Pot', 'Pot']),
            16 => $littlesucculents_f([POT, 12, 4, 1, BLUE, DECK_POT, 'Pot', 'Pot']),
            17 => $littlesucculents_f([POT, 6, 2, 1, RED, DECK_POT, 'Pot', 'Pot']),
            18 => $littlesucculents_f([POT, 8, 3, 1, RED, DECK_POT, 'Pot', 'Pot']),
            19 => $littlesucculents_f([POT, 12, 4, 1, RED, DECK_POT, 'Pot', 'Pot']),
            20 => $littlesucculents_f([POT, 4, 1, 6, RAINBOW, DECK_POT, 'Pot', 'Pot']),
            21 => $littlesucculents_f([PLANT, 0, 0, 6, PINK, SET_A . PINK, BABY_TOES, 'Baby Toes']),
            22 => $littlesucculents_f([PLANT, 0, 0, 6, ORANGE, SET_A . ORANGE, SNAKE_PLANT, 'Snake Plant']),
            23 => $littlesucculents_f([PLANT, 0, 0, 6, YELLOW, SET_A . YELLOW, MEXICAN_FIRECRACKER, 'Mexican Firecracker']),
            24 => $littlesucculents_f([PLANT, 0, 0, 6, GREEN, SET_A . GREEN, STRING_OF_PEARLS, 'String of Pearls']),
            25 => $littlesucculents_f([PLANT, 0, 0, 6, BLUE, SET_A . BLUE, STRING_OF_DOLPHINS, 'String of Dolphins']),
            26 => $littlesucculents_f([PLANT, 0, 0, 6, RED, SET_A . RED, JELLYBEAN_PLANT, 'Jellybean Plant']),
            27 => $littlesucculents_f([PLANT, 0, 0, 6, PINK, SET_B . PINK, CALICO_HEARTS, 'Calico Hearts']),
            28 => $littlesucculents_f([PLANT, 0, 0, 6, ORANGE, SET_B . ORANGE, BUNNY_EARS, 'Bunny Ears']),
            29 => $littlesucculents_f([PLANT, 0, 0, 6, YELLOW, SET_B . YELLOW, RIBBON_PLANT, 'Ribbon Plant']),
            30 => $littlesucculents_f([PLANT, 0, 0, 6, GREEN, SET_B . GREEN, BABY_SUN_ROSE, 'Baby Sun Rose']),
            31 => $littlesucculents_f([PLANT, 0, 0, 6, BLUE, SET_B . BLUE, CORAL_CACTUS, 'Coral Cactus']),
            32 => $littlesucculents_f([PLANT, 0, 0, 6, RED, SET_B . RED, LIVING_STONE, 'Living Stone']),
            33 => $littlesucculents_f([PLANT, 0, 0, 1, RAINBOW, DECK_PLANT, RAINBOW_WEST, 'Rainbow West']),
            34 => $littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, ALOE_VERA, 'Aloe Vera']),
            35 => $littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, MOON_CACTUS, 'Moon Cactus']),
            36 => $littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, LEAF_WINDOW, 'Leaf Window']),
            37 => $littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, MERMAID_TAIL, 'Mermaid Tail']),
            38 => $littlesucculents_f([PLANT, 0, 0, 1, GREY, DECK_PLANT, PET_ROCK, 'Pet Rock']),
            39 => $littlesucculents_f([POT, 4, 2, 4, GREY, STARTER . POT, 'Pot', 'Pot']),
            40 => $littlesucculents_f([PLANT, 0, 0, 4, GREY, STARTER . PLANT, MONEY_PLANT, 'Money Plant']),
            41 => $littlesucculents_f([WATER, 0, 1, 3, GREY, WATER, 'Water', 'Water']),
            42 => $littlesucculents_f([WATER, 0, 2, 3, GREY, WATER, 'Water', 'Water']),
            43 => $littlesucculents_f([WATER, 0, 3, 3, GREY, WATER, 'Water', 'Water']),
            44 => $littlesucculents_f([WATER, 0, 4, 3, GREY, WATER, 'Water', 'Water']),
        ];
    }
}
