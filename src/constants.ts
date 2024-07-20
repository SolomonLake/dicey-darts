export const DICE_SIDES = 4;

export const NUM_DICE = 4;

export const NUM_DICE_CHOICE = 2;

export const MAX_POSITION = 3;

export const NUM_SUMS_TO_END_GAME = 5;

export const SUM_SCORES: { [key: number]: number } = {
    2: 30,
    3: 15,
    4: 5,
    5: 1,
    6: 5,
    7: 15,
    8: 30,
};

export const SUM_FONT_SIZES: { [key: number]: string } = {
    2: "text-base md:text-lg",
    3: "text-lg md:text-xl",
    4: "text-xl md:text-2xl",
    5: "text-2xl md:text-3xl",
    6: "text-xl md:text-2xl",
    7: "text-lg md:text-xl",
    8: "text-base md:text-lg",
};

export const DEFAULT_NUM_PLAYERS = 2;

export const LOCAL_STORAGE_MATCH_PREFIX = "playerID for matchID=";
