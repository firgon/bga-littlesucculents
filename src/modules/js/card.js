let gretchensgarden_f = (data) => {
  return {
    type: data[0],
    maxLeaf: data[1],
    maxWater: data[2],
    nb: data[3],
    color: data[4],
    deck: data[5],
    class: data[6],
    name: data[7],
  };
};

/*
 * Game Constants
 */
const POT = "pot";
const PLANT = "plant";

const YELLOW = "yellow";
const PURPLE = "purple";
const GREEN = "green";
const BLUE = "blue";
const GREY = "grey";
const RED = "red";

// prettier-ignore
const CARDS_DATA = {
    1: gretchensgarden_f[POT, 2, 1, 8, GREY, STARTER, 'Pot', 'Pot'],
    2: gretchensgarden_f[POT, 6, 2, 1, PINK, DECK_POT, 'Pot', 'Pot'],
    3: gretchensgarden_f[POT, 8, 3, 1, PINK, DECK_POT, 'Pot', 'Pot'],
    4: gretchensgarden_f[POT, 12, 4, 1, PINK, DECK_POT, 'Pot', 'Pot'],
    5: gretchensgarden_f[POT, 6, 2, 1, ORANGE, DECK_POT, 'Pot', 'Pot'],
    6: gretchensgarden_f[POT, 8, 3, 1, ORANGE, DECK_POT, 'Pot', 'Pot'],
    7: gretchensgarden_f[POT, 12, 4, 1, ORANGE, DECK_POT, 'Pot', 'Pot'],
    8: gretchensgarden_f[POT, 6, 2, 1, YELLOW, DECK_POT, 'Pot', 'Pot'],
    9: gretchensgarden_f[POT, 8, 3, 1, YELLOW, DECK_POT, 'Pot', 'Pot'],
    10: gretchensgarden_f[POT, 12, 4, 1, YELLOW, DECK_POT, 'Pot', 'Pot'],
    11: gretchensgarden_f[POT, 6, 2, 1, GREEN, DECK_POT, 'Pot', 'Pot'],
    12: gretchensgarden_f[POT, 8, 3, 1, GREEN, DECK_POT, 'Pot', 'Pot'],
    13: gretchensgarden_f[POT, 12, 4, 1, GREEN, DECK_POT, 'Pot', 'Pot'],
    14: gretchensgarden_f[POT, 6, 2, 1, BLUE, DECK_POT, 'Pot', 'Pot'],
    15: gretchensgarden_f[POT, 8, 3, 1, BLUE, DECK_POT, 'Pot', 'Pot'],
    16: gretchensgarden_f[POT, 12, 4, 1, BLUE, DECK_POT, 'Pot', 'Pot'],
    17: gretchensgarden_f[POT, 6, 2, 1, RED, DECK_POT, 'Pot', 'Pot'],
    18: gretchensgarden_f[POT, 8, 3, 1, RED, DECK_POT, 'Pot', 'Pot'],
    19: gretchensgarden_f[POT, 12, 4, 1, RED, DECK_POT, 'Pot', 'Pot'],
    20: gretchensgarden_f[POT, 4, 1, 6, RAINBOW, DECK_POT, 'Pot', 'Pot'],
    21: gretchensgarden_f[PLANT, 0, 0, 6, PINK, SET_A, 'BabyToes', 'Baby Toes'],
    22: gretchensgarden_f[PLANT, 0, 0, 6, ORANGE, SET_A, 'SnakePlant', 'Snake Plant'],
    23: gretchensgarden_f[PLANT, 0, 0, 6, YELLOW, SET_A, 'MexicanFirecracker', 'Mexican Firecracker'],
    24: gretchensgarden_f[PLANT, 0, 0, 6, GREEN, SET_A, 'StringofPearls', 'String of Pearls'],
    25: gretchensgarden_f[PLANT, 0, 0, 6, BLUE, SET_A, 'StringofDolphins', 'String of Dolphins'],
    26: gretchensgarden_f[PLANT, 0, 0, 6, RED, SET_A, 'JellybeanPlant', 'Jellybean Plant'],
    27: gretchensgarden_f[PLANT, 0, 0, 6, PINK, SET_B, 'CalicoHearts', 'Calico Hearts'],
    28: gretchensgarden_f[PLANT, 0, 0, 6, ORANGE, SET_B, 'BunnyEars', 'Bunny Ears'],
    29: gretchensgarden_f[PLANT, 0, 0, 6, YELLOW, SET_B, 'RibbonPlant', 'Ribbon Plant'],
    30: gretchensgarden_f[PLANT, 0, 0, 6, GREEN, SET_B, 'BabySunRose', 'Baby Sun Rose'],
    31: gretchensgarden_f[PLANT, 0, 0, 6, BLUE, SET_B, 'CoralCactus', 'Coral Cactus'],
    32: gretchensgarden_f[PLANT, 0, 0, 6, RED, SET_B, 'LivingStone', 'Living Stone'],
    33: gretchensgarden_f[PLANT, 0, 0, 1, RAINBOW, DECK_PLANT, 'RainbowWest', 'Rainbow West'],
    34: gretchensgarden_f[PLANT, 0, 0, 1, GREY, DECK_PLANT, 'AloeVera', 'Aloe Vera'],
    35: gretchensgarden_f[PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MoonCactus', 'Moon Cactus'],
    36: gretchensgarden_f[PLANT, 0, 0, 1, GREY, DECK_PLANT, 'LeafWindow', 'Leaf Window'],
    37: gretchensgarden_f[PLANT, 0, 0, 1, GREY, DECK_PLANT, 'MermaidTail', 'Mermaid Tail'],
    38: gretchensgarden_f[PLANT, 0, 0, 1, GREY, DECK_PLANT, 'PetRock', 'Pet Rock'],
  }
