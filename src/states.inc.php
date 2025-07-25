<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * LittleSucculents implementation : © Emmanuel Albisser <emmanuel.albisser@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * LittleSucculents game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

require_once 'modules/php/constants.inc.php';

$machinestates = [

    // The initial state. Please do not modify.
    ST_GAME_SETUP => [
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [
            "" => 2,
        ]
    ],

    ST_PLAY => [
        "name" => "play",
        "description" => clienttranslate('${actplayer} can buy a card, cut another player succulent, flower his succulent or tend to his succulents'),
        "descriptionmyturn" => clienttranslate('${you} can : '),
        "type" => ACTIVE_PLAYER,
        "args" => "argPlay",
        "action" => "stPlay",
        "possibleactions" => ['actBuy', 'actCut', 'actFlower', 'actChooseTend', 'actGenericAction'],
        "transitions" => [
            CONFIRM => ST_CONFIRM,
            ZOMBIE_PASS => ST_NEXT_PLAYER,
            END_TURN => ST_NEXT_PLAYER,
            'chooseTend' => ST_TEND
        ]
    ],

    ST_TEND => [
        "name" => "tend",
        "description" => clienttranslate('${actplayer} can move and water flower'),
        "descriptionmyturn" => clienttranslate('${you} must choose your first action'),
        "type" => ACTIVE_PLAYER,
        "args" => "argTend",
        "action" => "stTend",
        "possibleactions" => ['actChooseAction', 'actUndo', 'actGenericAction'],
        "transitions" => [
            "move" => ST_MOVE,
            "water" => ST_WATER_SOLO,
            UNDO => ST_PLAY,
            CONFIRM => ST_CONFIRM,
            ZOMBIE_PASS => ST_NEXT_PLAYER,
        ]
    ],

    ST_MOVE => [
        "name" => "move",
        "description" => clienttranslate('${actplayer} can move or swap two flowers'),
        "descriptionmyturn" => clienttranslate('${you} must select a succulent to move or swap'),
        "descriptionOnlyOne" => clienttranslate('${actplayer} can still move one flower'),
        "descriptionmyturnOnlyOne" => clienttranslate('${you} can still move one flower'),
        "type" => ACTIVE_PLAYER,
        "args" => "argMove",
        "action" => "stMove",
        "possibleactions" => ['actMovePlants', 'actUndo', 'actPass', 'actGenericAction'],
        "transitions" => [
            UNDO => ST_PLAY,
            END_TURN => ST_TEND,
            ZOMBIE_PASS => ST_NEXT_PLAYER,
        ]
    ],

    ST_WATER_SOLO => [
        "name" => "waterSolo",
        "description" => clienttranslate('${actplayer} must spread their water tokens'),
        "descriptionmyturn" => clienttranslate('${you} must spread your water tokens'),
        "type" => ACTIVE_PLAYER,
        "args" => "argWaterSolo",
        "possibleactions" => ['actWaterSolo', 'actUndo', 'actGenericAction'],
        "transitions" => [
            END_TURN => ST_GROW_SOLO,
            UNDO => ST_PLAY,
            ZOMBIE_PASS => ST_NEXT_PLAYER,
        ]
    ],

    ST_GROW_SOLO => [
        "name" => "growSolo",
        "description" => clienttranslate('Growing phase'),
        "type" => GAME,
        "action" => "stGrowSolo",
        "transitions" => [
            END_TURN => ST_TEND,
            ZOMBIE_PASS => ST_NEXT_PLAYER,
        ]
    ],

    ST_CONFIRM => [
        "name" => "confirm",
        "description" => clienttranslate('${actplayer} must confirm his turn or undo'),
        "descriptionmyturn" => clienttranslate('${you} must confirm your turn or undo'),
        "type" => ACTIVE_PLAYER,
        // "args" => "argConfirm",
        "possibleactions" => ['actConfirm', 'actUndo', 'actGenericAction'],
        "transitions" => [
            UNDO => ST_PLAY,
            END_TURN => ST_NEXT_PLAYER,
            ZOMBIE_PASS => ST_NEXT_PLAYER,
        ]
    ],

    ST_AUTOMATIC_WATER => [
        "name" => "automaticWater",
        "description" => clienttranslate('Water Phase'),
        "type" => GAME,
        "action" => "stAutomaticWater",
        "transitions" => [
            END_TURN => ST_WATER
        ]
    ],

    ST_WATER => [
        "name" => "water",
        "description" => clienttranslate('All players must spread their water tokens'),
        "descriptionmyturn" => clienttranslate('${you} must spread your water tokens'),
        "type" => MULTI,
        "args" => "argWater",
        "possibleactions" => ['actWater', 'actChangeMind', 'actGenericAction'],
        "transitions" => [
            END_TURN => ST_REGISTER_WATER
        ]
    ],

    ST_REGISTER_WATER => [
        "name" => "registerWater",
        "description" => clienttranslate('Water Phase'),
        "type" => GAME,
        "action" => "stRegisterWater",
        "transitions" => [
            END_TURN => ST_BABY_SUN_ROSE
        ]
    ],

    ST_BABY_SUN_ROSE => [
        "name" => "babySunRose",
        "description" => clienttranslate('All players with Baby Sun Rose can move a leaf on them'),
        "descriptionmyturn" => clienttranslate('${you} can choose which of your Baby Sun Roses activate'),
        "type" => MULTI,
        "action" => "stBabySunRose",
        "args" => "argBabySunRose",
        "possibleactions" => ['actBabySunRose', 'actDeny', 'actGenericAction'],
        "transitions" => [
            END_TURN => ST_GROW
        ]
    ],

    ST_GROW => [
        "name" => "grow",
        "description" => clienttranslate('Growing phase'),
        "type" => GAME,
        "action" => "stGrow",
        "transitions" => [
            END_TURN => ST_SEASON_END
        ]
    ],

    //TODO
    // ST_BABY_SUN_ROSE2 => [
    //     "name" => "babySunRose",
    //     "description" => clienttranslate('All players with Baby Sun Rose can move a leaf on them'),
    //     "descriptionmyturn" => clienttranslate('${you} can move a leaf on your Baby Sun Rose'),
    //     "type" => MULTI,
    //     "action" => "stBabySunRose",
    //     "args" => "argBabySunRose",
    //     "possibleactions" => ['actBabySunRose', 'actGenericAction'],
    //     "transitions" => [
    //         END_TURN => ST_SEASON_END
    //     ]
    // ],

    ST_SEASON_END => [
        "name" => "seasonEnd",
        "description" => clienttranslate('Season End'),
        "type" => GAME,
        "action" => "stSeasonEnd",
        "transitions" => [
            END_TURN => ST_PLAY
        ]

    ],

    ST_NEXT_PLAYER => [
        'name' => 'nextPlayer',
        'type' => GAME,
        'action' => 'stNextPlayer',
        'transitions' => [
            'grow' => ST_AUTOMATIC_WATER,
            END_TURN => ST_PLAY
        ],
    ],

    ST_PRE_END_OF_GAME => [
        'name' => 'preEndOfGame',
        'type' => GAME,
        'action' => 'stPreEndOfGame',
        'transitions' => [END_TURN => ST_END_GAME],
    ],

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"

    ]
];
