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
 * littlesucculents.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */
$swdNamespaceAutoload = function ($class) {
    $classParts = explode('\\', $class);
    if ($classParts[0] == 'LSU') {
        array_shift($classParts);
        $file = dirname(__FILE__) . '/modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
        if (file_exists($file)) {
            require_once $file;
        } else {
            var_dump('Cannot find file : ' . $file);
        }
    }
};
spl_autoload_register($swdNamespaceAutoload, true, true);

require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');

require_once 'modules/php/constants.inc.php';

use LSU\Managers\Players;
use LSU\Managers\Cards;
use LSU\Core\Globals;
use LSU\Core\Preferences;
use LSU\Core\Stats;
use LSU\Helpers\Log;

// use LSU\Helpers\Log;

class LittleSucculents extends Table
{
    use LSU\DebugTrait;
    use LSU\States\TurnTrait;
    use LSU\States\GenericTrait;
    use LSU\States\BuyTrait;
    use LSU\States\GrowTrait;

    public static $instance = null;
    function __construct()
    {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        self::$instance = $this;
        self::initGameStateLabels([
            'logging' => 10,
        ]);
        Stats::checkExistence();
        $this->bIndependantMultiactiveTable = true;
    }

    public static function get()
    {
        return self::$instance;
    }

    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "littlesucculents";
    }

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        Players::setupNewGame($players, $options);
        //Stats::checkExistence();
        Cards::setupNewGame($players, $options);

        $this->setGameStateInitialValue('logging', false);
        $this->activeNextPlayer();

        Globals::setupNewGame($players, $options, Players::getActiveId());
        Log::enable();
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    public function getAllDatas()
    {
        $pId = self::getCurrentPId();
        return [
            'players' => Players::getUiData($pId),
            'cards' => Cards::getUiData(),
            'turn' => 12 - Cards::countInLocation(WATER)
        ];
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        return intval((12 - (Cards::countInLocation(WATER) + 1)) / 12 * 100);
    }

    function actChangePreference($pref, $value)
    {
        Preferences::set($this->getCurrentPId(), $pref, $value);
    }
    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */

    /////////////////////////////////////
    //////////// Prevent deadlock ///////
    /////////////////////////////////////

    // Due to deadlock issues involving the playersmultiactive and player tables,
    //   standard tables are queried FOR UPDATE when any operation occurs -- AJAX or refreshing a game table.
    //
    // Otherwise at least two situations have been observed to cause deadlocks:
    //   * Multiple players in a live game with tabs open, two players trading multiactive state back and forth.
    //   * Two players trading multiactive state back and forth, another player refreshes their game page.
    // function queryStandardTables()
    // {
    //     // Query the standard global table.
    //     self::DbQuery('SELECT global_id, global_value FROM global WHERE 1 ORDER BY global_id FOR UPDATE');
    //     // Query the standard player table.
    //     self::DbQuery('SELECT player_id id, player_score score FROM player WHERE 1 ORDER BY player_id FOR UPDATE');
    //     // Query the playermultiactive  table. DO NOT USE THIS is you don't use $this->bIndependantMultiactiveTable=true
    //     // self::DbQuery(
    //     //     'SELECT ma_player_id player_id, ma_is_multiactive player_is_multiactive FROM playermultiactive ORDER BY player_id FOR UPDATE'
    //     // );

    //     // TODO should the stats table be queried as well?
    // }

    /** This is special function called by framework BEFORE any of your action functions */
    // protected function initTable()
    // {
    //     $this->queryStandardTables();
    // }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player)
    {
        $statename = $state['name'];

        if ($state['type'] === "activeplayer") {
            switch ($statename) {

                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');

            return;
        }

        throw new feException("Zombie mode not supported at this game state: " . $statename);
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
     * upgradeTableDb
     *  - int $from_version : current version of this game database, in numerical form.
     *      For example, if the game was running with a release of your game named "140430-1345", $from_version is equal to 1404301345
     */
    public function upgradeTableDb($from_version) {}

    /////////////////////////////////////////////////////////////
    // Exposing protected methods, please use at your own risk //
    /////////////////////////////////////////////////////////////

    // Exposing protected method getCurrentPlayerId
    public function getCurrentPId()
    {
        return self::getCurrentPlayerId();
    }

    // Exposing protected method translation
    public function translate($text)
    {
        return self::_($text);
        _('Baby Toes');
        _('Balanced display<br>5 <vp>');
        _('Snake Plant');
        _('Plant is max <leaf><br>5 <vp>');
        _('Mexican Firecracker');
        _('Most 5 <vp><br>Second 2 <vp>');
        _('String of Pearls');
        _('Pot size<br>+6');
        _('String of Dolphins');
        _('Growth<br>+2');
        _('Jellybean Plant');
        _('1 <vp> per colour<br>in display');
        _('Calico Hearts');
        _('1 <vp> per space<br>from money plant');
        _('Bunny Ears');
        _('Total <leaf><br>Odd -1 <vp>/ Even 4 <vp>');
        _('Ribbon Plant');
        _('1 <vp> per copy<br>in all displays');
        _('Baby Sun Rose');
        _('Take 1 <leaf> from display<br>in grow phase');
        _('Coral Cactus');
        _('+1 <water><br> in grow phase');
        _('Living Stone');
        _('3 <vp>');
        _('Rainbow West');
        _('Can flower<br>the colour of its pot');
        _('Aloe Vera');
        _('each <water> in wathering can<br> is worth 1 <vp>');
        _('Moon Cactus');
        _('If no flowers in display<br>7 <vp>');
        _('Leaf Window');
        _('If money plant is max <leaf><br>7 <vp>');
        _('Mermaid Tail');
        _('Display has most plants<br>7 <vp>');
        _('Pet Rock');
        _('<leaf> don\'t score<br>5 <vp>');
        _('Money Plant');
        _('<leaf> are <money><br>but worth 0<vp>');
    }

    // Shorthand
    public function getArgs()
    {
        return $this->gamestate->state()['args'];
    }
}
