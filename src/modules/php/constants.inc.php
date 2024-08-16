<?php



/*
 * Game Constants
 */

const POT = "pot";
const PLANT = "plant";
const WATER = "water";


const GREY = "grey";

const YELLOW = "yellow";
const GREEN = "green";
const BLUE = "blue";
const RED = "red";
const PINK = "pink";
const ORANGE = "orange";
const ALL_COLORS = [YELLOW, ORANGE, GREEN, BLUE, RED, PINK];

const RAINBOW = "rainbow";
const SET_A = "setA";
const SET_B = "setB";
const STARTER = "starter";

/*
 * State constants
 */

const BUY = 'buy';

const ST_GAME_SETUP = 1;

const ST_PLAY = 2;
const ST_MOVE_PLANT = 3;

const ST_CONFIRM = 5;

const ST_NEXT_PLAYER = 10;

const ST_GROW = 15;



const ST_PRE_END_OF_GAME = 98;
const ST_END_GAME = 99;


/****
 * Cheat Module
 */

const OPTION_PLANT_SET = 100;
const OPTION_PLANT_SET_A = 0;
const OPTION_PLANT_SET_B = 1;
const OPTION_PLANT_RANDOM_SET = 2;

const PREF_CONFIRM = 201;
const PREF_CONFIRM_YES = 2;
const PREF_CONFIRM_TIMER = 1;
const PREF_CONFIRM_NO = 0;
/******************
 ****** STATS ******
 ******************/

// const STAT_LSULECTED_CRISTAL = 11;
// const STAT_WATER_SOURCES_POINTS = 12;
// const STAT_ANIMALS_POINTS = 13;
// const STAT_BIOMES_POINTS = 14;
// const STAT_SPORES_POINTS = 15;
// const STAT_ALIGNMENTS = 16;
// const STAT_END_STEP_ACTIVATIONS = 17;
// const STAT_END_ROUND_ACTIVATIONS = 18;

// const STAT_NAME_LSULECTED_CRISTAL = 'collectedCristal';
// const STAT_NAME_WATER_SOURCES_POINTS = 'waterSourcePoints';
// const STAT_NAME_ANIMALS_POINTS = 'animalsPoints';
// const STAT_NAME_BIOMES_POINTS = 'biomesPoints';
// const STAT_NAME_SPORES_POINTS = 'sporePoints';
// const STAT_NAME_ALIGNMENTS = 'alignments';
// const STAT_NAME_END_STEP_ACTIVATIONS = 'endStepActivations';
// const STAT_NAME_END_ROUND_ACTIVATIONS = 'endRoundActivations';

/*
*  ██████╗ ███████╗███╗   ██╗███████╗██████╗ ██╗ ██████╗███████╗
* ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗██║██╔════╝██╔════╝
* ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ██████╔╝██║██║     ███████╗
* ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗██║██║     ╚════██║
* ╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║██║╚██████╗███████║
*  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝
*                                                               
*/


const GAME = "game";
const MULTI = "multipleactiveplayer";
const PRIVATESTATE = "private";

const END_TURN = 'endTurn';
const END_GAME = 'endGame';
const UNDO = "undo";
const ACTIVE_PLAYER = "activeplayer";
const CONFIRM = 'confirm';

//location
const BOARD = "board";
const PLAYER = "player";
const VISIBLE_DECK = "visibleDeck";
const DECK_PLANT = "deckplant";
const DECK_POT = "deckpot";
const BOX = 'box';
const DISCARD = 'discard';

//flags
const FLOWERED = 1;
const NOT_FLOWERED = 0;
