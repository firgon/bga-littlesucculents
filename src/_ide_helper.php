<?php

/** @noinspection PhpDocRedundantThrowsInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */
/** @noinspection PhpUnreachableStatementInspection */

namespace Bga\GameFramework\Actions {
    #[\Attribute]
    class CheckAction {
        public function __construct(
            public bool $enabled = true,
        ) {}
    }
}

namespace Bga\GameFramework\Actions\Types {
    #[\Attribute]
    class IntParam {
        public function __construct(
            ?string $name = null,
            public ?int $min = null, 
            public ?int $max = null,
        ) {}

        public function getValue(string $paramName): int { return 0; }
    }

    #[\Attribute]
    class BoolParam  {
        public function __construct(
            ?string $name = null,
        ) {}

        public function getValue(string $paramName): bool { return false; }
    }

    #[\Attribute]
    class FloatParam {
        public function __construct(
            ?string $name = null,
            public ?float $min = null, 
            public ?float $max = null,
        ) {}

        public function getValue(string $paramName): float { return 0; }
    }

    #[\Attribute]
    class IntArrayParam {
        public function __construct(
            ?string $name = null,
            public ?int $min = null, 
            public ?int $max = null,
        ) {}

        public function getValue(string $paramName): array { return []; }
    }

    #[\Attribute]
    class StringParam {
        public function __construct(
            ?string $name = null,
            public ?bool $alphanum = false, 
            public ?bool $alphanum_dash = false, 
            public ?bool $base64 = false, 
            public ?array $enum = null,
        ) {}
    
        public function getValue(string $paramName): string { return ''; }
    }

    #[\Attribute]
    class JsonParam {
        public function __construct(
            ?string $name = null,
            public ?bool $associative = true,
            public ?bool $alphanum = true, 
        ) {}
    
        public function getValue(string $paramName): mixed { return []; }    
    }
}

namespace Bga\GameFramework {
    enum StateType: string
    {
        case ACTIVE_PLAYER = 'activeplayer';
        case MULTIPLE_ACTIVE_PLAYER = 'multipleactiveplayer';
        case PRIVATE = 'private';
        case GAME = 'game';
        case MANAGER = 'manager';
    }

    /**
     * A builder for game states.
     * To be called with `[game state id] => GameStateBuilder::create()->...[set all necessary properties]->build()`
     * in the states.inc.php file. 
     */
    final class GameStateBuilder
    {
        /**
         * Create a new GameStateBuilder.
         */
        public static function create(): self
        {
            return new self();
        }

        /**
         * Return the game setup state (should have id 1).
         * To be called with `[game state id] => GameStateBuilder::gameSetup(10)->build()` if your first game state is 10.
         * If not set in the GameState array, it will be automatically created with a transition to state 2.
         * 
         * @param $nextStateId the first real game state, just after the setup (default 2).
         */
        public static function gameSetup(int $nextStateId = 2): self
        {
            return self::create();
        }

        /**
         * Return the game end score state (usually, id 98).
         * This is a common state used for end game scores & stats computation.
         * If the game dev uses it, they must define the function `stEndScore` with a call to `$this->gamestate->nextState();` at the end.
         */
        public static function endScore(): self
        {
            return self::create();
        }

        /**
         * Return the game end state (should have id 99).
         * If not set in the GameState array, it will be automatically created.
         */
        public static function gameEnd(): self
        {
            return self::create();
        }

        /**
         * The name of the state.
         */
        public function name(string $name): self
        {
            return $this;
        }

        /**
         * The type of the state. MANAGER should not be used, except for setup and end game states.
         */
        public function type(StateType $type): self
        {
            return $this;
        }

        /**
         * The description for inactive players. Should be `clienttranslate('...')` if not empty.
         */
        public function description(string $description): self
        {
            return $this;
        }

        /**
         * The description for active players. Should be `clienttranslate('...')` if not empty.
         */
        public function descriptionMyTurn(string $descriptionMyTurn): self
        {
            return $this;
        }

        /**
         * The PHP function to call when entering the state.
         * Usually prefixed by `st`.
         */
        public function action(string $action): self
        {
            return $this;
        }

        /**
         * The PHP function returning the arguments to send to the front when entering the state.
         * Usually prefixed by `arg`.
         */
        public function args(string $args): self
        {
            return $this;
        }

        /**
         * The list of possible actions in the state.
         * Usually prefixed by `act`.
         */
        public function possibleActions(array $possibleActions): self
        {
            return $this;
        }

        /**
         * The list of transitions to other states. The key is the transition name and the value is the state to transition to.
         * Example: `['endTurn' => ST_END_TURN]`.
         */
        public function transitions(array $transitions): self
        {
            return $this;
        }

        /**
         * Set to true if the game progression has changed (to be recalculated with `getGameProgression`)
         */
        public function updateGameProgression(bool $update): self
        {
            return $this;
        }

        /**
         * For multi active states with inner private states, the initial state to go to.
         */
        public function initialPrivate(int $initial): self
        {
            return $this;
        }

        /**
         * Export the built GameState as an array.
         */
        public function build(): array
        {
            return [];
        }
    }


    abstract class Notify {
        /**
         * Add a decorator function, to be applied on args when a notif function is called.
         */
        public function addDecorator(callable $fn) {
           //
        }

        /**
         * Send a notification to a single player of the game.
         *
         * @param int $playerId the player ID to send the notification to.
         * @param string $notifName a comprehensive string code that explain what is the notification for.
         * @param string $message some text that can be displayed on player's log window (should be surrounded by clienttranslate if not empty).
         * @param array $args notification arguments.
         */
        public function player(int $playerId, string $notifName, ?string $message = '', array $args = []): void {
            //
        }

        /**
         * Send a notification to all players of the game and spectators (public).
         *
         * @param string $notifName a comprehensive string code that explain what is the notification for.
         * @param string $message some text that can be displayed on player's log window (should be surrounded by clienttranslate if not empty).
         * @param array $args notification arguments.
         */
        public function all(string $notifName, ?string $message = '', array $args = []): void {
            //
        }
    }

    abstract class TableOptions {
        /**
         * Get the value of a table option.
         * Returns null if the option doesn't exist (for example on a table created before a new option was added).
         */
        public function get(int $optionId): ?int {
            return 0;
        }
    
        /**
         * Indicates if the table is Turn-based.
         */
        function isTurnBased(): bool {
            return false;
        }
    
        /**
         * Indicates if the table is Real-time.
         */
        function isRealTime(): bool {
            return false;
        }
    }

    abstract class UserPreferences {
        /**
         * Gets the value of a user preference for a player (cached in game DB). Null if unset.
         */
        function get(int $playerId, int $prefId): ?int
        {
            return null;
        }
    }


    abstract class Table extends \APP_Object
    {
        /**
         * Access the underlying game state object.
         */
        readonly public \GameState $gamestate;

        /**
         * Access the underlying global values.
         */
        readonly public \Bga\GameFramework\Db\Globals $globals;

        /**
         * Access the underlying Notify object.
         */
        readonly public \Bga\GameFramework\Notify $notify;

        /**
         * Access the underlying TableOptions object.
         */
        readonly public \Bga\GameFramework\TableOptions $tableOptions;

        /**
         * Access the underlying UserPreferences object.
         */
        readonly public \Bga\GameFramework\UserPreferences $userPreferences;

        /**
         * Default constructor.
         */
        public function __construct()
        {
            //
        }

        /**
         * Return the number of row affected by the last operation.
         *
         * @see mysql_affected_rows()
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final static public function DbAffectedRow(): int
        {
            return 0;
        }

        /**
         * Return the PRIMARY key of the last inserted row
         *
         * @see mysql_insert_id()
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final static public function DbGetLastId(): int
        {
            return 0;
        }

        /**
         * Performs a query on the database.
         *
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final static public function DbQuery(string $sql): null|\mysqli_result|bool
        {
            return null;
        }

        /**
         * You must use this function on every string type data in your database that contains unsafe data (unsafe = can
         * be modified by a player). This method makes sure that no SQL injection will be done through the string used.
         *
         * NOTE: if you are using standard types in ajax actions, like `AT_alphanum` it is sanitized before arrival,
         * this is only needed if you manage to get unchecked string, like in the games where user has to enter text as
         * a response.
         *
         * @see mysql_real_escape_string()
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final static public function escapeStringForDB(string $string): string
        {
            return ''; 
        }

        /**
         * Return an array of rows for a sql SELECT query. The result is the same as `getCollectionFromDB` except that
         * the result is a simple array (and not an associative array). The result can be empty.
         *
         * If you specified `$bUniqueValue = true` and if your SQL query request 1 field, the method returns directly an
         * array of values.
         *
         * @see Table::getCollectionFromDB
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final static public function getObjectListFromDB(string $sql, bool $bUniqueValue = false): array
        {
            return [];
        }

        /**
         * Returns a unique value from the database, or `null` if no value is found.
         *
         * @throws \BgaSystemException Raise an exception if more than 1 row is returned.
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final static public function getUniqueValueFromDB(string $sql): mixed
        {
            return null;
        }

        /**
         * Make the next player active in the natural player order.
         *
         * NOTE: You **cannot** use this method in an `activeplayer` or `multipleactiveplayer` state. You must use a
         * `game` type game state for this.
         *
         * @return int the new active player id
         */
        final public function activeNextPlayer(): int|string
        {
            return '0';
        }

        /**
         * Check if the current player can perform a specific action in the current game state, and optionally throw an
         * exception if they can't.
         *
         * The action is valid if it is listed in the "possibleactions" array for the current game state (see game
         * state description). This method MUST be the first one called in ALL your PHP methods that handle player
         * actions, in order to make sure a player doesn't perform an action not allowed by the rules at the point in
         * the game. It should not be called from methods where the current player is not necessarily the active player,
         * otherwise it may fail with an "It is not your turn" exception.
         *
         * If `bThrowException` is set to `false`, the function returns false in case of failure instead of throwing an
         * exception. This is useful when several actions are possible, in order to test each of them without throwing
         * exceptions.
         *
         * @throws \BgaSystemException if `$bThrowException` is true and a failure occurs
         */
        final public function checkAction(string $actionName, bool $bThrowException = true): mixed
        {
            return null;
        }

        /**
         * In some games, this is useful to eliminate a player from the game in order he/she can start another game
         * without waiting for the current game end.
         *
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Player_elimination
         */
        final public function eliminatePlayer(int $playerId): void
        {
            //
        }

        /**
         * Get the "active_player", whatever what is the current state type.
         *
         * Note: it does NOT mean that this player is active right now, because state type could be "game" or
         * "multiplayer".
         *
         * Note: avoid using this method in a "multiplayer" state because it does not mean anything.
         */
        final public function getActivePlayerId(): string|int
        {
            return '0'; 
        }

        /**
         * Get the "active_player" name
         *
         * Note: avoid using this method in a "multiplayer" state because it does not mean anything.
         */
        final public function getActivePlayerName(): string
        {
            return ''; 
        }

        /**
         ***************************************************************************************************************
         * Globals.
         **************************************************************************************************************
         */

        /**
         * Returns an associative array of rows for a SQL SELECT statement.
         *
         * The key of the resulting associative array is the first field specified in the SELECT query. The value of the
         * resulting associative array is an associative array with all the field specified in the SELECT query and
         * associated values. First column must be a primary or alternate key (semantically, it does not actually have
         * to declared in sql as such). The resulting collection can be empty (it won't be null). If you specified
         * `$bSingleValue = true` and if your SQL query requests 2 fields `A` and `B`, the method returns an associative
         * array `A => B`, otherwise its `A => [A,B]`.
         *
         * NOTE: The name a bit misleading, it really returns associative array, i.e. map and NOT a collection. You
         * cannot use it to get list of values which may have duplicates (hence primary key requirement on first
         * column). If you need simple array use `getObjectListFromDB()` method.
         *
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final public function getCollectionFromDB(string $sql, bool $bSingleValue = false): array
        {
            return [];
        }

        /**
         * Get the "current_player". The current player is the one from which the action originated (the one who sent
         * the request). In general, you shouldn't use this method, unless you are in "multiplayer" state.
         *
         * **NOTE: This is not necessarily the active player!**
         *
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#File-Structure
         */
        final public function getCurrentPlayerId(bool $bReturnNullIfNotLogged = false): string|int
        {
            return '0';
        }

        /**
         * Return an associative array of associative array, from a SQL SELECT query. First array level correspond to
         * first column specified in SQL query. Second array level correspond to second column specified in SQL query.
         *
         * If `$bSingleValue = true`, keep only third column on result
         *
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final public function getDoubleKeyCollectionFromDB(string $sql, bool $bSingleValue = false): array
        {
            return [];
        }

        /**
         * Returns an index of the selected language as defined in gameinfos.inc.php.
         */
        final public function getGameLanguage(): string
        {
            return '';
        }

        /**
         * Compute and return the current game progression.
         *
         * The number returned must be an integer between 0 and 100.
         *
         * This method is called each time we are in a game state with the "updateGameProgression" property set to true.
         *
         * @return int
         * @see ./states.inc.php
         */
        public function getGameProgression()
        {
            //
        }

        /**
         * Retrieve the value of a global. Returns $default if global has not been initialized (by
         * `setGameStateInitialValue`).
         *
         * NOTE: this method use globals "cache" if you directly manipulated globals table OR call this function after
         * `undoRestorePoint()` - it won't work as expected.
         */
        final public function getGameStateValue(string $label, ?int $default = null): int|string
        {
            return '0';
        }

        /**
         * Returns the value of a user preference for a player. It will return the value currently selected in the
         * select combo box, in the top-right menu.
         * @deprecated use $this->userPreferences->get(int $playerId, int $prefId)
         */
        final public function getGameUserPreference(int $playerId, int $prefId): ?int
        {
            return 0;
        }

        /**
         * Returns game information. Please refer to `gameinfos.inc.php` for more information and returned array
         * attributes.
         *
         * @return array{
         *     game_name: string,
         *     publisher: string,
         *     publisher_website: string,
         *     publisher_bgg_id: string,
         *     bgg_id: int,
         *     players: array<int>,
         *     suggest_player_number: ?array<int>,
         *     not_recommend_player_number: ?array<int>,
         *     estimated_duration: int,
         *     fast_additional_time: int,
         *     medium_additional_time: int,
         *     slow_additional_time: int,
         *     tie_breaker_description: string,
         *     losers_not_raned: bool,
         *     solo_mode_ranked: bool,
         *     is_beta: int,
         *     is_coop: int,
         *     language_dependency: bool,
         *     player_colors: array<string>,
         *     favorite_colors_support: bool,
         *     disable_player_order_swap_on_rematch: bool,
         *     game_interface_width: array{
         *         min: int,
         *     }
         * }
         * @see gameinfos.inc.php
         */
        final public function getGameinfos(): array
        {
            return [];
        }

        /**
         * Return an associative array which associate each player with the next player around the table.
         *
         * In addition, key 0 is associated to the first player to play.
         *
         * @return array<int, int>
         */
        final public function getNextPlayerTable(): array
        {
            return [];
        }

        /**
         * Same as `getCollectionFromDB`, but raises an exception if the collection is empty.
         *
         * @throws \BgaSystemException if the collection is empty.
         * @see Table::getCollectionFromDB()
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final public function getNonEmptyCollectionFromDB(string $sql): array
        {
            return [];
        }

        /**
         * Returns one row for the sql SELECT query as an associative array or null if there is no result (where fields
         * are keys mapped to values).
         *
         * @throws \BgaSystemException if the query return no row.
         * @see Table::getObjectFromDB()
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final public function getNonEmptyObjectFromDB(string $sql): array
        {
            return [];
        }

        /**
         * Returns one row for the sql SELECT query as an associative array or null if there is no result (where fields
         * are keys mapped to values).
         *
         * @throws \BgaSystemException if the query return more than one row.
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Accessing_the_database
         */
        final public function getObjectFromDB(string $sql): array
        {
            return [];
        }

        /**
         * Get player playing after given player in natural playing order.
         */
        final public function getPlayerAfter(int $playerId): int
        {
            return 0;
        }

        /**
         * Get player playing before given player in natural playing order.
         */
        final public function getPlayerBefore(int $playerId): int
        {
            return 0;
        }

        /**
         * Get the player color by player id;
         */
        final public function getPlayerColorById(int $playerId): string
        {
            return '';
        }

        /**
         * Get the player name by player id.
         */
        final public function getPlayerNameById(int $playerId): string
        {
            return '';
        }

        /**
         * Get 'player_no' (number) by player id.
         */
        final public function getPlayerNoById(int $playerId): int
        {
            return 0;
        }

        /**
         * Returns the number of players playing at the table.
         *
         * @return int
         */
        final public function getPlayersNumber()
        {
            //
        }

        /**
         * Returns an array of user preference colors to game colors.
         * Game colors must be among those which are passed to `Table::reattributeColorsBasedOnPreferences()`.
         *
         * Each game color can be an array of suitable colors, or a single color:
         *
         * ```
         * [
         *    // The first available color chosen:
         *    'ff0000' => ['990000', 'aa1122'],
         *    // This color is chosen, if available
         *    '0000ff' => '000099',
         * ]
         * ```
         *
         * If no color can be matched from this array, then the default implementation is used.
         *
         * @return array<string, ?string>
         */
        public function getSpecificColorPairings(): array
        {
            return [];
        }

        /**
         * Return the value of statistic specified by $name. Useful when creating derivative statistics such as average.
         */
        final public function getStat(string $name, ?int $playerId = null): int
        {
            return 0;
        }

        /**
         * Give standard extra time to this player.
         */
        final public function giveExtraTime(int $playerId, ?int $specificTime = null): void
        {
            //
        }

        /**
         * Increment the current value of a global. If increment is negative, decrement the value of the global.
         *
         * Return the final value of the global. If global was not initialized it will initialize it as 0.
         *
         * NOTE: this method use globals "cache" if you directly manipulated globals table OR call this function after
         * `undoRestorePoint()` - it won't work as expected.
         */
        final public function incGameStateValue(string $label, int $increment): int
        {
            return 0;
        }

        /**
         * Increment (or decrement) specified statistic value by `$inc` value. Same behavior as `Table::setStat()`
         * function.
         */
        final public function incStat(int $inc, string $name, ?int $playerId = null, bool $bDoNotLoop = false): void
        {
            //
        }

        /**
         * Create a statistic entry with a default value.
         *
         * This method must be called for each statistic of your game, in your setupNewGame method. If you neglect to
         * call this for a statistic, and also do not update the value during the course of a certain game using
         * `setStat` or `incStat`, the value of the stat will be undefined rather than 0. This will result in it being
         * ignored at the end of the game, as if it didn't apply to that particular game, and excluded from cumulative
         * statistics. As a consequence - if do not want statistic to be applied, do not init it, or call set or inc
         * on it.
         *
         * - `$table_or_player` must be set to "table" if this is a table statistic, or "player" if this is a player statistic.
         * - `$name` is the name of your statistic, as it has been defined in your stats.inc.php file.
         * - `$value` is the initial value of the statistic. If this is a player statistic and if the player is not specified by "$player_id" argument, the value is set for ALL players.
         */
        final public function initStat(string $tableOrPlayer, string $name, int $value, ?int $playerId = null): void
        {
            //
        }

        /**
         * Returns true if game is turn based, false if it is realtime
         * @deprecated use $this->tableOptions->isTurnBased()
         */
        final public function isAsync(): bool
        {
            return false;
        }

        /**
         * Returns true if game is realtime, false if it is async.
         * @deprecated use $this->tableOptions->isRealTime()
         */
        final public function isRealtime(): bool
        {
            return false;
        }

        /**
         * Check the "current_player" spectator status. If true, the user accessing the game is a spectator (not part of
         * the game). For this user, the interface should display all public information, and no private information
         * (like a friend sitting at the same table as players and just spectating the game).
         *
         * @return bool
         */
        final public function isSpectator(): bool
        {
            return false;
        }

        /**
         * Get an associative array with generic data about players (ie: not game specific data).
         *
         * @return array<int, array{ player_name: string, player_color: string, player_no: int}>
         */
        final public function loadPlayersBasicInfos()
        {
            //
        }

        /**
         * This function will have no visible consequence for your game, but will allow players to report the text to
         * moderators if something happens.
         */
        final public function logTextForModeration(int $playerId, string $message): void
        {
            //
        }

        /**
         * Send a notification to all players of the game and spectators (public).
         *
         * @param string $notification_type a comprehensive string code that explain what is the notification for.
         * @param string $notification_log some text that can be displayed on player's log window (should be surrounded by clienttranslate if not empty).
         * @param array $notification_args notification arguments.
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#NotifyAllPlayers
         */
        final public function notifyAllPlayers(string $notificationType, string $notificationLog, array $notificationArgs): void
        {
            //
        }

        /**
         * Send a notification to a single player of the game.
         *
         * @param int $player_id the player ID to send the notification to.
         * @param string $notification_type a comprehensive string code that explain what is the notification for.
         * @param string $notification_log some text that can be displayed on player's log window (should be surrounded by clienttranslate if not empty).
         * @param array $notification_args notification arguments.
         * @see https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#NotifyAllPlayers
         */
        final public function notifyPlayer(int $playerId, string $notificationType, string $notificationLog, array $notificationArgs): void
        {
            //
        }

        /**
         * Re-attribute colors based on players' preferences.
         *
         * @param array<int, array> $players
         * @param array<string> $colors
         * @return void
         */
        final public function reattributeColorsBasedOnPreferences(array $players, array $colors): void
        {
            //
        }

        /**
         * Initialize or reload players information.
         *
         * @return void
         */
        final public function reloadPlayersBasicInfos(): void
        {
            //
        }

        /**
         * Remove some legacy data with the given key.
         */
        final public function removeLegacyData(int $playerId, string $key): void
        {
            //
        }

        /**
         * Same as `Table::storeLegacyData()`, except that it stores some data for the whole team within the current
         * table and does not use a key.
         */
        final public function removeLegacyTeamData(): void
        {
            //
        }

        /**
         * Get data associated with $key for the current game.
         */
        final public function retrieveLegacyData($playerId, $key): array
        {
            return [];
        }

        /**
         * Same as `Table::storeLegacyData()`, except that it stores some data for the whole team within the current
         * table and does not use a key.
         */
        final public function retrieveLegacyTeamData(): array
        {
            return [];
        }

        /**
         * Initialize global value. This is not required if you ok with default value if 0. This should be called from
         * `Table::setupNewGame()` function.
         */
        final public function setGameStateInitialValue(string $label, int $value): void
        {
            //
        }

        /**
         * Set the current value of a global.
         */
        final public function setGameStateValue(string $label, int $value): void
        {
            //
        }

        /**
         * Set a statistic `$name` to `$value`.
         *
         * - If `$player_id` is not specified, setStat consider it is a TABLE statistic.
         * - If `$player_id` is specified, setStat consider it is a PLAYER statistic.
         */
        final public function setStat(int $value, string $name, ?int $player_id = null, bool $bDoNotLoop = false): void
        {
            //
        }

        /**
         * Can be used in state machine to make everybody active as `st` method of multiplayeractive state, it just
         * calls `GameState::setAllPlayersMultiactive()`.
         *
         * @return void
         */
        final public function stMakeEveryoneActive(): void
        {
            //
        }

        /**
         * Store some data associated with $key for the given user / current game.
         *
         * In the opposite of all other game data, this data will PERSIST after the end of this table, and can be
         * re-used in a future table with the same game.
         *
         * IMPORTANT: The only possible place where you can use this method is when the game is over at your table
         * (last game action). Otherwise, there is a risk of conflicts between ongoing games.
         *
         * In any way, the total data (= all keys) you can store for a given user+game is 64k (note: data is store
         * serialized as JSON data).
         *
         * NOTICE: You can store some persistent data across all tables from your game using the specific player_id 0
         * which is unused. In such case, it's even more important to manage correctly the size of your data to avoid
         * any exception or issue while storing updated data (ie. you can use this for some kind of leaderboard for solo
         * game or contest).
         *
         * Note: This function cannot be called during game setup (will throw an error).
         */
        final public function storeLegacyData(int $playerId, string $key, array $data, int $ttl = 365): void
        {
            //
        }

        /**
         * Same as `Table::storeLegacyData()`, except that it stores some data for the whole team within the current
         * table and does not use a key.
         */
        final public function storeLegacyTeamData(array $data, int $ttl = 365): void
        {
            //
        }

        /**
         * Restore the situation previously saved as an "Undo save point".
         */
        final public function undoRestorePoint(): void
        {
            //
        }

        /**
         * Save the whole game situation inside an "Undo save point".
         */
        final public function undoSavepoint(): void
        {
            //
        }

        /**
         * Migrate database if you change it after release on production.
         *
         * @param int $from_version
         * @return void
         */
        public function upgradeTableDb($from_version)
        {
            //
        }

        /**
         * Translation function using appropriate gettext domain.
         */
        protected function _(string $text): string
        {            
            return '';
        }

        /**
         * Make the previous player active (in the natural player order).
         *
         * NOTE: You **cannot** use this method in an `activeplayer` or `multipleactiveplayer` state. You must use a
         * `game` type game state for this.
         *
         * @return int the new active player id
         */
        final protected function activePrevPlayer(): void
        {
            //
        }

        /**
         * Using $players array creates a map of current => next as in example from getNextPlayerTable(), however you
         * can use custom order here. If parameter $bLoop is set to true then last player will points to first (creating
         * a loop), false otherwise. In any case index 0 points to first player (first element of $players array).
         *
         * Note: This function DOES NOT change the order in database, it only creates a map using key/values as descibed.
         *
         * @param array<int, ?int> $players
         */
        final protected function createNextPlayerTable(array $players, bool $bLoop = true): void
        {
            //
        }

        /**
         * Where you retrieve all game data during a complete reload of the game. Return value must be associative
         * array. Value of `players` is reserved for returning players data from players table, if you set it must
         * follow certain rules.
         *
         * @return array
         */
        abstract protected function getAllDatas(): array;

        /**
         * Get the "current_player" color.
         *
         * Note: avoid using this method in a "multiplayer" state because it does not mean anything.
         *
         * @throws \BgaSystemException if the current player is not at the table (i.e. spectator).
         */
        final protected function getCurrentPlayerColor(): string
        {
            return '';
        }

        /**
         * Get the "current_player" name.
         *
         * Note: avoid using this method in a "multiplayer" state because it does not mean anything.
         *
         * @throws \BgaSystemException if the current player is not at the table (i.e. spectator).
         */
        final protected function getCurrentPlayerName($bReturnEmptyIfNotLogged = false): string
        {
            return '';
        }

        /**
         * Return an associative array which associate each player with the previous player around the table.
         *
         * @return array<int, int>
         */
        final protected function getPrevPlayerTable($players): array
        {
            return [];
        }

        /**
         * This method should be located at the beginning of constructor. This is where you
         * define the globals used in your game logic, by assigning them IDs.
         *
         * You can define up to 80 globals, with IDs from 10 to 89 (inclusive, there can be gaps). Also you must use
         * this method to access value of game options Game_options_and_preferences:_gameoptions.inc.php, in that case,
         * IDs need to be between 100 and 199. You must not use globals outside the range defined above, as those values
         * are used by other components of the framework.
         *
         * @param array<string, int> $labels
         */
        final protected function initGameStateLabels(array $labels): void
        {
            //
        }

        /**
         * Called for every php callback by the framework, and it can be implemented by the game (empty by default).
         *
         * You can use it in rare cases where you need to read database and manipulate some data before ANY php * entry
         * functions are called (such as `getAllDatas`, `action*`, `st*`, etc.).
         *
         * Note: it is not called before `arg**` methods.
         */
        protected function initTable(): void
        {
            //
        }

        /**
         * Check the "current_player" zombie status. If true, player is zombie, i.e. left or was kicked out of the game.
         *
         * @throws \BgaSystemException if the current player is not at the table (i.e. spectator).
         */
        final protected function isCurrentPlayerZombie(): bool
        {
            return false;
        }

        /**
         * This method is called only once, when a new game is launched. In this method, you must setup the game
         * according to the game rules, so that the game is ready to be played.
         *
         * @param array<int, array{ player_canal: string, player_name: string, player_avatar: string, player_colors: array<string> }> $players
         * @param array $options
         * @return void
         */
        abstract protected function setupNewGame($players, $options = []);

        /**
         * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
         * You can do whatever you want in order to make sure the turn of this player ends appropriately
         * (ex: pass).
         *
         * Important: your zombie code will be called when the player leaves the game. This action is triggered
         * from the main site and propagated to the gameserver from a server, not from a browser.
         * As a consequence, there is no current player associated to this action. In your zombieTurn function,
         * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, otherwise it will fail with a
         * "Not logged" error message.
         *
         * @param array{ type: string, name: string } $state
         * @param int $active_player
         * @return void
         */
        abstract protected function zombieTurn(array $state, int $active_player): void;

        /**
         * To get a Deck instance with `$this->getNew("module.common.deck")`
         * 
         * @param string $objectName must be 'module.common.deck'
         */
        protected function getNew(string $objectName): \Bga\GameFramework\Components\Deck {
            return new \Bga\GameFramework\Components\Deck();
        }
    
        /**
         * Apply an SQL upgrade of the tables.
         * Use DBPREFIX_<table_name> for all tables in the $sql parameter.
         */
        function applyDbUpgradeToAllDB(string $sql): void {
        }

        /**
         * For authorized games using external API only.
         */
        function getGenericGameInfos(string $api, array $args = []) : array {
            return [];
        }

        /**
         * Return the BGA environment this table is running on.
         * This should be used for debug purpose only.
         * 
         * @return string "studio" or "prod"
         */
        static function getBgaEnvironment(): string {
            return '';
        }
    }
}

namespace Bga\GameFramework\Db {
    abstract class Globals
    {
        /**
         * Delete global variables.
         */
        public function delete(string ...$names): void
        {
            //
        }

        /**
         * Returns the value of `$name` if it exists. Otherwise, fallback on `$defaultValue`.
         * 
         * @template T of object
         * @param string $name the variable name
         * @param mixed $defaultValue the value to return if the variable doesn't exist in database
         * @param class-string<T>|string $class the class of the expected object, to returned a typed object. For example `Undo::class`.
         * @return ($class is class-string<T> ? T : mixed)
         */
        public function get(string $name, mixed $defaultValue = null, ?string $class = null): mixed
        {
            return null;
        }
        
        /**
         * Retrieve all variables stored in DB (or a selected subset, if the function is called with parameters).
         */
        public function getAll(string ...$names): array
        {
            return [];
        }

        /**
         * Returns true if globals has a key `$name`.
         */
        public function has(string $name): bool
        {
            return false;
        }

        /**
         * Increment the global `$name` by `$step`.
         *
         * @throws BgaSystemException if the global `$name` is not a numeric value.
         */
        public function inc(string $name, int $step): int
        {
            return 0;
        }

        /**
         * Set `$name` with the value `$value`.
         */
        public function set(string $name, mixed $value): void
        {
            //
        }
    }

}

namespace Bga\GameFramework\Components {

    class Deck extends \Deck
    {
        var $autoreshuffle;
        var $autoreshuffle_trigger; 

        /**
         * Set the databasetable name.
         * MUST be called before any other method.
         */
        function init(string $table) {}

        /**
         * This is the way cards are created and should not be called during the game.
         * Cards are added to the deck (not shuffled)
         * Cards is an array of "card types" with at least the followin fields:
         * array( 
         *      array(                              // This is my first card type
         *          "type" => "name of this type"   // Note: <10 caracters
         *          "type_arg" => <type arg>        // Argument that should be applied to all card of this card type
         *          "nbr" => <nbr>                  // Number of cards with this card type to create in game
         *
         * If location_arg is not specified, cards are placed at location extreme position
         */
        function createCards(array $cards, string $location = 'deck', ?int $location_arg = null) {}
        
        /**
         * Get position of extreme cards (top or back) on the specific location.
         */
        function getExtremePosition(bool $getMax , string $location): int
        {
            return false;
        }
        
        /**
         * Shuffle cards of a specified location.
         */
        function shuffle(string $location)
        {
        }
        
        /**
         * Pick the first card on top of specified deck and give it to specified player.
         * Return card infos or null if no card in the specified location.
         */
        function pickCard(string $location, int $player_id): ?array
        {
            return [];
        }
        
        /**
         * Pick the "nbr" first cards on top of specified deck and give it to specified player.
         * Return card infos (array) or null if no card in the specified location.
         */
        function pickCards(int $nbr, string $location, int $player_id): ?array
        {
            return [];
        }

        /**
         * Pick the first card on top of specified deck and place it in target location.
         * Return card infos or null if no card in the specified location.
         */
        function pickCardForLocation(string $from_location, string $to_location, int $location_arg=0 ): ?array
        {
            return [];
        }

        /**
         * Pick the first "$nbr" cards on top of specified deck and place it in target location.
         * Return cards infos or void array if no card in the specified location.
         */
        function pickCardsForLocation(int $nbr, string $from_location, string $to_location, int $location_arg=0, bool $no_deck_reform=false ): ?array
        {
            return [];
        }
        
        /**
         * Return card on top of this location.
         */
        function getCardOnTop(string $location): ?array
        {
            return [];
        }

        /**
         * Return "$nbr" cards on top of this location.
         */
        function getCardsOnTop(int $nbr, string $location): ?array
        {
            return [];
        }
        
        /**
         * Move a card to specific location.
         */
        function moveCard(int $card_id, string $location, int $location_arg=0): void
        {
        }

        /**
         * Move cards to specific location.
         */
        function moveCards(array $cards, string $location, int $location_arg=0): void
        {
        }
        
        /**
         * Move a card to a specific location where card are ordered. If location_arg place is already taken, increment
         * all cards after location_arg in order to insert new card at this precise location.
         */
        function insertCard(int $card_id, string $location, int $location_arg ): void
        {
        }

        /**
         * Move a card on top or at bottom of given "pile" type location. (Lower numbers: bottom of the deck. Higher numbers: top of the deck.)
         */
        function insertCardOnExtremePosition(int $card_id, string $location, bool $bOnTop): void
        {
        }

        /**
         * Move all cards from a location to another.
         * !!! location arg is reseted to 0 or specified value !!!
         * if "from_location" and "from_location_arg" are null: move ALL cards to specific location
         */
        function moveAllCardsInLocation(?string $from_location, ?string $to_location, ?int $from_location_arg=null, int $to_location_arg=0 ): void
        {
        }

        /**
         * Move all cards from a location to another.
         * location arg stays with the same value
         */
        function moveAllCardsInLocationKeepOrder(string $from_location, string $to_location): void
        {
        }
        
        /**
         * Return all cards in specific location.
         * note: if "order by" is used, result object is NOT indexed by card ids
         */
        function getCardsInLocation(string|array $location, ?int $location_arg = null, ?string $order_by = null ): array
        {
            return [];
        }
        
        /**
         * Get all cards in given player hand.
         * Note: This is an alias for: getCardsInLocation( "hand", $player_id ) 
         */
        function getPlayerHand(int $player_id): array
        {
            return [];
        }
        
        /**
         * Get specific card infos
         */ 
        function getCard(int $card_id ): ?array
        {
            return [];
        }
        
        /**
         * Get specific cards infos
         */ 
        function getCards(array $cards_array ): array
        {
            return [];
        }
        
        /**
         * Get cards from their IDs (same as getCards), but with a location specified. Raises an exception if the cards are not in the specified location.
         */
        function getCardsFromLocation(array $cards_array, string $location, ?int $location_arg = null ): array
        {
            return [];
        }
        
        /**
         * Get card of a specific type.
         */
        function getCardsOfType(mixed $type, ?int $type_arg=null ): array
        {
            return [];
        }
        
        /**
         * Get cards of a specific type in a specific location.
         */
        function getCardsOfTypeInLocation(mixed $type, ?int $type_arg=null, string $location, ?int $location_arg = null ): array
        {
            return [];
        }
        
        /**
         * Move a card to discard pile.
         */
        function playCard(int $card_id): void
        {
        }
        
        /**
         * Return the number of cards in specified location. 
         */
        function countCardInLocation(string $location, ?int $location_arg=null): int|string
        {
            return '0';
        }
        
        /**
         * Return the number of cards in specified location. 
         */
        function countCardsInLocation(string $location, ?int $location_arg=null): int|string
        {
            return '0';
        }
        
        /**
         * Return an array "location" => number of cards.
         */
        function countCardsInLocations(): array
        {
            return [];
        }
        
        /**
         * Return an array "location_arg" => number of cards (for this location).
         */
        function countCardsByLocationArgs(string $location): array
        {
            return [];
        }
    }
}

namespace {
    exit("This file should not be included, only analyzed by your IDE");

    /**
     * Dummy value, for autocomplete.
     */
    const APP_GAMEMODULE_PATH = "";

    /**
     * Dummy value, for autocomplete.
     */
    const APP_BASE_PATH = "";

    /**
     * This function is transparent: it will return the original English string without any change. Its only purpose is
     * to mark this string as "must be translated", and to make sure the translated version of the string will be
     * available on client side.
     *
     * **Do not put any HTML tag inside the `$text` argument. Use notification argument, instead.**
     */
    function clienttranslate(string $text): string
    {
        return ''; 
    }

    /**
     * This function works exactly like 'clienttranslate', except it tells BGA that the string is not needed on client
     * side.
     * @deprecated use JSON options/stats instead, where there is no need to mark translatable strings.
     */
    function totranslate(string $text): string
    {
        return ''; 
    }

    function bga_rand(int $min, int $max): int {
        return 0;
    }

    abstract class APP_Object
    {
        /**
         * Debug message. Appear only if needed.
         */
        final public function debug(string $message): void
        {
            //
        }

        /**
         * Dump an object with a custom prefix.
         */
        final public function dump(string $prefix, mixed $object): void
        {
            //
        }

        /**
         * Error message. Appear in production.
         */
        final public function error(string $message): void
        {
            //
        }

        /**
         * Standard log message (INFO level).
         */
        final public function trace(string $message): void
        {
            //
        }

        /**
         * Warning message. Appear in production.
         */
        final public function warn(string $message): void
        {
            //
        }
    }

    abstract class APP_Template
    {
        /**
         * TBD.
         */
        final public function begin_block(string $template_name, string $block_name): void
        {
            //
        }

        /**
         * TBD.
         */
        final public function begin_subblock(string $template_name, string $block_name): void
        {
            //
        }

        /**
         * TBD.
         */
        final public function insert_block(string $block_name, array $tpl = []): void
        {
            //
        }

        /**
         * TBD.
         */
        final public function insert_subblock(string $block_name, array $tpl = []): void
        {
            //
        }
    }

    abstract class game_view
    {
        /**
         * Underlying access to the table game.
         */
        readonly protected \Bga\GameFramework\Table $game;

        /**
         * Underlying access to the template.
         */
        readonly protected APP_Template $page;

        /**
         * Variables to inject into the template.
         *
         * @var array<string, mixed>
         */
        protected array $tpl;

        /**
         * @param array $viewArgs
         * @return void
         */
        abstract public function build_page($viewArgs);

        /**
         * Translation function using appropriate gettext domain.
         * 
         * @deprecated use clienttranslate instead.
         */
        final protected function _(string $text): string
        {
            return ''; 
        }

        /**
         * @return string
         */
        abstract protected function getGameName();

        final protected function raw(string $string): array
        {
            return [];
        }

        /**
         * Get the player id of the player requesting the view.
         */
        protected function getCurrentPlayerId(): int
        {
            return 0;
        }
    }

    abstract class GameState extends APP_Object
    {
        /**
         * You can call this method to make any player active.
         *
         * NOTE: you CANNOT use this method in an "activeplayer" or "multipleactiveplayer" state. You must use a "game"
         * type game state for this.
         */
        final public function changeActivePlayer(int $playerId): void
        {
            //
        }

        /**
         * This works exactly like `Table::checkAction()`, except that it does NOT check if the current player is
         * active.
         */
        final public function checkPossibleAction(string $actionName): void
        {
            //
        }

        /**
         * With this method you can retrieve the list of the active player at any time.
         *
         * - During a "game" type game state, it will return a void array.
         * - During an "activeplayer" type game state, it will return an array with one value (the active player id).
         * - During a "multipleactiveplayer" type game state, it will return an array of the active players' id.
         *
         * NOTE: You should only use this method in the latter case.
         */
        final public function getActivePlayerList(): array
        {
            return [];
        }

        /**
         * This return the private state or null if not initialized or not in private state.
         */
        final public function getPrivateState(int $playerId): array
        {
            return [];
        }

        /**
         * Player with the specified id is entering a first private state defined in the master state initial private
         * parameter.
         *
         * Everytime you need to start a private parallel states you need to call this or similar methods above
         *
         * - Note: player needs to be active (see above) and current game state must be a multiactive state with initial
         * private parameter defined
         * - Note: initial private parameter of master state should be set to the id of the first private state. This
         * private state needs to be defined in states.php with the type set to 'private'.
         * - Note: this method is usually preceded with activating that player
         * - Note: initializing private state can run action or args methods of the initial private state
         */
        final public function initializePrivateState(int $playerId): void
        {
            //
        }

        /**
         * All active players in a multiactive state are entering a first private state defined in the master state's
         * initialprivate parameter.
         *
         * Every time you need to start a private parallel states you need to call this or similar methods below.
         *
         * - Note: at least one player needs to be active (see above) and current game state must be a multiactive state
         * with initialprivate parameter defined
         * - Note: initialprivate parameter of master state should be set to the id of the first private state. This
         * private state needs to be defined in states.php with the type set to 'private'.
         * - Note: this method is usually preceded with activating some or all players
         * - Note: initializing private state can run action or args methods of the initial private state
         */
        final public function initializePrivateStateForAllActivePlayers(): void
        {
            //
        }

        /**
         * Players with specified ids are entering a first private state defined in the master state initialprivate
         * parameter.
         *
         * @param array<int> $playerIds
         */
        final public function initializePrivateStateForPlayers(array $playerIds): void
        {
            //
        }

        /**
         * Return true if we are in multipleactiveplayer state, false otherwise.
         */
        final public function isMutiactiveState(): bool
        {
            return false;
        }

        /**
         * Return true if specified player is active right now.
         *
         * This method take into account game state type, ie nobody is active if game state is "game" and several
         * players can be active if game state is "multiplayer".
         */
        final public function isPlayerActive(int $player_id): bool
        {
            return false;
        }

        /**
         * Change current state to a new state. Important: the $stateNum parameter is the key of the state.
         *
         * NOTE: This is very advanced method, it should not be used in normal cases. Specific advanced cases
         * include - jumping to specific state from "do_anytime" actions, jumping to dispatcher state or jumping to
         * recovery state from zombie player function.
         */
        final public function jumpToState(int $nextState, bool $bWithActions = true): void
        {
            //
        }

        /**
         * Player with specified id will transition to next private state specified by provided transition.
         *
         * - Note: game needs to be in a master state which allows private parallel states
         * - Note: transition should lead to another private state (i.e. a state with type defined as 'private'
         * - Note: transition should be defined in private state in which the players currently are.
         * - Note: this method can run action or args methods of the target state for specified player
         * - Note: this is usually used after some player actions to move to next private state
         */
        final public function nextPrivateState(int $playerId, string $transition): void
        {
            //
        }

        /**
         * All active players will transition to next private state by specified transition.
         *
         * - Note: game needs to be in a master state which allows private parallel states
         * - Note: transition should lead to another private state (i.e. a state with type defined as 'private'
         * - Note: transition should be defined in private state in which the players currently are.
         * - Note: this method can run action or args methods of the target state
         * - Note: this is usually used after initializing the private state to move players to specific private state
         * according to the game logic
         */
        final public function nextPrivateStateForAllActivePlayers(string $transition): void
        {
            //
        }

        /**
         * Players with specified ids will transition to next private state specified by provided transition.
         * Same considerations apply as for the method above.
         *
         * @param array<int> $playerIds
         */
        final public function nextPrivateStateForPlayers(array $playerIds, string $transition): void
        {
            //
        }

        /**
         * Change current state to a new state.
         *
         * NOTE: the `$transition` parameter is the name of the transition, and NOT the name of the target game state.
         *
         * @see states.inc.php
         */
        final public function nextState(string $transition = ''): void
        {
            //
        }

        /**
         * Reload the current state.
         */
        final public function reloadState(): void
        {
            //
        }

        /**
         * All playing players are made active. Update notification is sent to all players (this will trigger
         * `onUpdateActionButtons`).
         *
         * Usually, you use this method at the beginning of a game state (e.g., `stGameState`) which transitions to a
         * `multipleactiveplayer` state in which multiple players have to perform some action. Do not use this method if
         * you're going to make some more changes in the active player list. (I.e., if you want to take away
         * `multipleactiveplayer` status immediately afterward, use `setPlayersMultiactive` instead).
         */
        final public function setAllPlayersMultiactive(): void
        {
            //
        }

        /**
         * All playing players are made inactive. Transition to next state.
         */
        final public function setAllPlayersNonMultiactive(string $nextState): bool
        {
            return false;
        }

        /**
         * During a multi-active game state, make the specified player inactive.
         *
         * Usually, you call this method during a multi-active game state after a player did his action. It is also
         * possible to call it directly from multiplayer action handler. If this player was the last active player, the
         * method trigger the "next_state" transition to go to the next game state.
         */
        final public function setPlayerNonMultiactive(int $player, string $nextState): bool
        {
            return false;
        }

        /**
         * Make a specific list of players active during a multiactive game state. Update notification is sent to all
         * players whose state changed.
         *
         * - "players" is the array of player id that should be made active. If "players" is not empty the value of
         * "next_state" will be ignored (you can put whatever you want).
         * - If "bExclusive" parameter is not set or false it doesn't deactivate other previously active players. If
         * it's set to true, the players who will be multiactive at the end are only these in "$players" array.
         * - In case "players" is empty, the method trigger the "next_state" transition to go to the next game state.
         *
         * Returns true if state transition happened, false otherwise.
         */
        final public function setPlayersMultiactive(array $players, string $nextState, bool $bInactivePlayersNotOnTheList = false): bool
        {
            return false;
        }

        /**
         * For player with specified id a new private state would be set.
         *
         * - Note: game needs to be in a master state which allows private parallel states
         * - Note: this should be rarely used as it doesn't check if the transition is allowed (it doesn't even specify
         * transition). This can be useful in very complex cases when standard state machine is not adequate (i.e.
         * specific cards can lead to some micro action in various states where defining transitions back and forth can
         * become very tedious.)
         * - Note: this method can run action or args methods of the target state for specified player
         */
        final public function setPrivateState(int $playerId, int $newStateId): void
        {
            //
        }

        /**
         * Get an associative array of current game state attributes.
         *
         * @see states.inc.php
         */
        final public function state(bool $bSkipStateArgs = false, bool $bOnlyVariableContent = false, bool $bSkipReflexionTimeLoad = false): array
        {
            return [];
        }

        /**
         * Get the id of the current game state (rarely useful, it's best to use name, unless you use constants for
         * state ids).
         */
        final public function state_id(): string|int
        {
            return '0'; 
        }

        /**
         * For player with specified id private state will be reset to null, which means they will get out of private
         * parallel states and be in a master state like the private states are not used.
         *
         * - Note: game needs to be in a master state which allows private parallel states
         * - Note: this is usually used when deactivating player to clean up their parallel state
         * - Note: After unseating private state only actions on master state are possible
         * - Note: Usually it is not necessary to unset private state as it will be initialized to first private state
         * when private states are needed again. Nevertheless, it is generally better to clean private state when not
         * needed to avoid bugs.
         */
        final public function unsetPrivateState(int $playerId): void
        {
            //
        }

        /**
         * All players private state will be reset to null, which means they will get out of private parallel states and
         * be in a master state like the private states are not used.
         *
         * - Note: game needs to be in a master state which allows private parallel states
         * - Note: this is usually used to clean up after leaving a master state in which private states were used, but
         * can be used in other cases when we want to exit private parallel states and use a regular multiactive state
         * for all players
         * - Note: After unseating private state only actions on master state are possible
         * - Note: Usually it is not necessary to unset private states as they will be initialized to first private
         * state when private states are needed again. Nevertheless, it is generally better to clean private state after
         * exiting private parallel states to avoid bugs.
         */
        final public function unsetPrivateStateForAllPlayers(): void
        {
            //
        }

        /**
         * For players with specified ids private state will be reset to null, which means they will get out of private
         * parallel states and be in a master state like the private states are not used.
         *
         * @param array<int> $playerIds
         */
        final public function unsetPrivateStateForPlayers(array $playerIds): void
        {
            //
        }

        /**
         * Sends update notification about multiplayer changes. All multiactive set* functions above do that, however if
         * you want to change state manually using db queries for complex calculations, you have to call this yourself
         * after.
         *
         * Do not call this if you're calling one of the other setters above.
         */
        final public function updateMultiactiveOrNextState(string $nextStateIfNone): void
        {
            //
        }
    }

    /**
     * Only for compatibility, use directly \Bga\GameFramework\Table
     */
    abstract class Table extends \Bga\GameFramework\Table {}

    /** An integer. */
    const AT_int = 0;

    /** A positive integer. */
    const AT_posint = 1;

    /** A float. */
    const AT_float = 2;

    /** An email. */
    const AT_email = 3;

    /** An URL. */
    const AT_url = 4;

    /** A bool (`1`, `0`, `true`, `false`). */
    const AT_bool = 5;

    /** Enum with `argTypeDetails`. */
    const AT_enum = 6;

    /** Alphanum (`/[0-9a-zA-Z_]+/`). */
    const AT_alphanum = 7;

    /** Number list (`1,4;2,3;-1,2`). */
    const AT_numberlist = 13;

    /** Alphanum + dash and spaces (`/[0-9a-zA-Z_-\s]+/`). */
    const AT_alphanum_dash = 27;

    /** JSON string. */
    const AT_json = 32;

    /** Base64 string. */
    const AT_base64 = 33;

    abstract class APP_GameAction extends APP_Object
    {
        /**
         * The associated table game instance.
         */
        protected \Bga\GameFramework\Table $game;

        /**
         * The underlying view to process.
         */
        protected string $view = "";

        /**
         * The view argument to pass to the template.
         *
         * @var array{ table: int }
         */
        protected array $viewArgs = [];

        /**
         * This is the constructor. Do not try to implement a `__construct` to bypass this method.
         */
        public function __default()
        {
            //
        }

        /**
         * Must be used at the end of each action method.
         */
        final protected function ajaxResponse(): void
        {
            //
        }

        /**
         * This method must be used to retrieve the arguments sent with your AJAX query.
         *
         * You must not use "_GET", "_POST" or equivalent PHP variables to do this, as it is unsafe.
         *
         * @throws BgaSystemException if `$bMandatory` is set to true and the argument is not found.
         */
        final protected function getArg(string $argName, int $argType, bool $bMandatory = false, mixed $default = null, array $argTypeDetails = [], bool $bCanFail = false): mixed
        {
            return null;
        }

        /**
         * This is a useful method when you only want to check if an argument is present or not present in your AJAX
         * request (and don't care about the value).
         *
         * It returns "true" or "false" according to whether "argName" has been specified as an argument of the AJAX
         * request or not.
         */
        final protected function isArg($argName): bool
        {
            return false;
        }

        /**
         * Must be used at the beginning of each action method.
         */
        final protected function setAjaxMode(): void
        {
            //
        }

        /**
         * Get the player id of the player requesting the action.
         */
        protected function getCurrentPlayerId(): int
        {
            return 0;
        }
    }

    /**
     *******************************************************************************************************************
     * Exceptions.
     *******************************************************************************************************************
     */

    /** Exception code to use when there's no real error. */
    const FEX_NOERROR = 0;

    /** Exception code to use when there's no public code. */
    const FEX_NOCODE = 100;

    /** Exception code to use when an input argument is invalid. */
    const FEX_bad_input_argument = 300;

    /** If you go over 64k, storeLegacyData function is going to FAIL and throws this exception code. */
    const FEX_legacy_size_exceeded = 805;

    /** Exception code to use when the game action is not allowed. */
    const FEX_game_action_no_allowed = 900;

    /** Exception code to use when it's not the player turn to play. */
    const FEX_this_is_not_your_turn = 901;

    /** Exception code to use when the action needs confirmation. */
    const FEX_please_confirm = 902;

    /**
     * Base exception.
     */
    class feException extends Exception
    {
        public function __construct($message, $expected = false, $visibility = true, $code=FEX_NOCODE, $publicMsg='', public ?array $args = null) {
        }
    }

    /**
     * Base class to notify a system exception. The message will be hidden from the user, but show in the logs. Use this
     * if the message contains technical information.
     *
     * You shouldn't use this type of exception except if you think the information shown could be critical. Indeed: a
     * generic error message will be shown to the user, so it's going to be difficult for you to see what happened.
     */
    class BgaSystemException extends feException
    {
        public function __construct($message, $code=FEX_NOCODE, ?array $args = null) {
        }
    }

    /**
     * You must throw this exception when you detect something that is not supposed to happened in your code.
     *
     * The error message is shown to the user as an "Unexpected error", in order that he can report it in the forum.
     * The error message is logged in BGA error logs. If it happens regularly, we will report it to you.
     */
    class BgaVisibleSystemException extends BgaSystemException
    {
        public function __construct($message, $code=FEX_NOCODE, ?array $args = null) {
        }
    }

    /**
     * Base class to notify a user error.
     *
     * You must throw this exception when a player wants to do something that they are not allowed to do. The error
     * message will be shown to the player as a "red message". The error message must be translated, make sure you use
     * `_()` here and NOT `clientranslate()`. Throwing such an exception is NOT considered a bug, so it is not traced in
     * BGA error logs.
     */
    class BgaUserException extends BgaVisibleSystemException
    {
        public function __construct($message, $code=FEX_NOCODE, ?array $args = null) {
        }
    }

    /**
     * @deprecated Use \Bga\GameFramework\Components\Deck instead
     */
    class Deck
    {
        
    }
}