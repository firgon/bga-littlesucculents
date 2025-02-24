/**
 * Your game interfaces
 */

interface Player {
  no: number;
  beginner: boolean;
  color: string;
  color_back: any | null;
  eliminated: number;
  id: string;
  is_ai: string;
  name: string;
  score: number;
  zombie: number;

  water: number;
  money: number;
  isFirst: boolean;
  scoreDetails: {
    [cardId: number]: [
      scoreForFlower: number,
      scoreForLeaves: number,
      scoreForPlant: number,
      args: any
    ];
  };
}

interface GameDatasCards {
  deckpot: number;
  deckplant: number;
  board: Card[];
  player: Card[];
  discardpot: { n: number; topCard?: Card };
  discardplant: { n: number; topCard?: Card };
  water: { n: number; topCard?: Card };
  waterboard: Card;
  visibleDeck: Card[];
  flowerableColors: string[];
}

interface GameDatas {
  current_player_id: string;
  decision: { decision_type: string };
  game_result_neutralized: string;
  gamestate: Gamestate;
  gamestates: { [gamestateId: number]: Gamestate };
  neutralized_player_id: string;
  notifications: { last_packet_id: string; move_nbr: string };
  playerorder: (string | number)[];
  players: { [playerId: number]: Player };
  tablespeed: string;
  activePlayers: number[];

  // Add here variables you set up in getAllDatas
  cheatModule: boolean;
  cards: GameDatasCards;
  turn: number;
}
