import type {
    AiEnumerate,
    Ctx,
    FilteredMetadata,
    Game,
    MoveFn,
} from "boardgame.io";
import {
    DEFAULT_NUM_PLAYERS,
    DICE_SIDES,
    MAX_POSITION,
    NUM_DICE,
    NUM_SUMS_TO_END_GAME,
    SUM_SCORES,
} from "./constants";
import { getOddsCalculator } from "./probs";
import {
    DiceSumOptions,
    SumOption,
    getSumOptions,
    isSumOptionSplit,
} from "./diceSumOptions";
import _ from "lodash";
import { INVALID_MOVE, Stage } from "boardgame.io/core";

type PlayerMove = {
    // Values of the 4 dice.
    diceValues?: number[];
    //0=horizontal, 1=vertical, 2=diagonal
    diceSplitIndex?: number;
    // [0] for the first 2, [1] for the last 2 and [0, 1] for all 4.
    diceUsed?: number[];
    // Did we bust on that move?
    bust?: boolean;
    // Player who made the move.
    playerID: string;
};

export type Positions = { [diceSum: string]: number };
export type CheckpointPositions = { [playerId: string]: Positions };
export type PlayerScores = { [playerId: string]: number };
export type TurnPhase = "rolling" | "selecting";
export type GameEndState = { winner?: string; draw?: boolean };
// export type PlayerInfo = { name: string };
export type PlayerInfo = FilteredMetadata[0] & {
    data?: {
        joined?: boolean;
    };
};
export type PlayerInfos = { [playerId: string]: PlayerInfo };

export interface DiceyDartsGameState {
    checkpointPositions: CheckpointPositions;
    currentPositions: Positions;
    currentOverflowPositions: Positions;
    diceSumOptions: DiceSumOptions | undefined;
    diceValues: number[];
    moveHistory: PlayerMove[];
    playerScores: PlayerScores;
    gameEndState: GameEndState | undefined;
    playerInfos: PlayerInfos;
    passAndPlay: boolean;
}

export type GameMoves = {
    rollDice: () => void;
    stop: () => void;
    selectDice: (diceSplitIndex: number, choiceIndex?: number) => void;
    playAgain: () => void;
    configureGame: () => void;
    setPlayerName: (playerId: string, name: string) => void;
    addPlayerInfo: (playerInfo: PlayerInfo) => void;
    removePlayerInfo: (playerId: string) => void;
    startPlaying: (playerInfos: PlayerInfos) => void;
    setPassAndPlay: (passAndPlay: boolean) => void;
};

export const calculateCurrentPlayerScores = (
    currentOverflowPositions: Positions,
    checkpointPositions: CheckpointPositions,
    playerScores: PlayerScores,
    currentPlayerId: string,
) => {
    // For each scores, add the score to the player's score if they aren't at max position in that checkpoint
    return _.mapValues(playerScores, (score, playerIdScore) => {
        _.mapValues(currentOverflowPositions, (overflowPos, col) => {
            if (overflowPos > 0) {
                const checkpoint = checkpointPositions[playerIdScore][col];
                if (
                    checkpoint !== MAX_POSITION &&
                    playerIdScore !== currentPlayerId
                ) {
                    const additionalScore: number = SUM_SCORES[parseInt(col)];
                    score += additionalScore * overflowPos;
                }
            }
        });
        return score;
    });
};

const rollDice: MoveFn<DiceyDartsGameState> = ({ G, random, ctx, events }) => {
    const diceValues = random.Die(DICE_SIDES, NUM_DICE);
    G.diceValues = diceValues;

    const move: PlayerMove = { diceValues, playerID: ctx.currentPlayer };
    G.diceSumOptions = getSumOptions(
        G.diceValues,
        G.currentPositions,
        G.checkpointPositions,
        ctx.currentPlayer,
        _.size(G.playerInfos),
    );
    const busted = G.diceSumOptions.every((sumOption: SumOption) =>
        sumOption.enabled.every((x) => !x),
    );
    if (busted) {
        events.endTurn();
        move.bust = true;
    } else {
        goToStage(G, events, ctx, "selecting");
        // events.setActivePlayers({ all: "selecting" });
    }
    G.moveHistory.push(move);
};

const configureGame: MoveFn<DiceyDartsGameState> = ({ G, events }) => {
    setupExistingGame(G);
    events.setPhase("configuringGame");
};

const setPassAndPlay: MoveFn<DiceyDartsGameState> = (
    { G, ctx, events },
    passAndPlay: boolean,
) => {
    G.passAndPlay = passAndPlay;
    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        goToStage(G, events, ctx, ctx.activePlayers?.[ctx.currentPlayer]);
    }
};

const alwaysAvailableMoves = {
    configureGame,
    setPassAndPlay,
};

const selectDice: MoveFn<DiceyDartsGameState> = (
    { G, ctx, events },
    diceSplitIndex: number,
    choiceIndex?: number,
) => {
    if (G.diceSumOptions == null || G.diceSumOptions[diceSplitIndex] == null) {
        throw new Error("assert false");
    }
    const numDiceEnabled = G.diceSumOptions[diceSplitIndex].enabled.filter(
        (x) => x,
    ).length;
    if (numDiceEnabled == 0) {
        return INVALID_MOVE;
    }

    const move = G.moveHistory[G.moveHistory.length - 1];
    move.diceSplitIndex = diceSplitIndex;

    const sumOption = G.diceSumOptions[diceSplitIndex];
    let { diceSums } = sumOption;
    const { enabled } = sumOption;

    if (isSumOptionSplit(sumOption)) {
        if (choiceIndex == null) {
            throw new Error("assert false");
        }
        if (isSumOptionSplit(sumOption) && !enabled[choiceIndex]) {
            return INVALID_MOVE;
        }
        diceSums = [diceSums[choiceIndex]];
        move.diceUsed = [choiceIndex];
    } else {
        move.diceUsed = diceSums
            .map((_, i) => (enabled[i] ? i : null))
            .filter((x) => x != null) as number[];
    }

    diceSums.forEach((col) => {
        const [newPos, overflowPos] = addToCurrentPositions(
            G.currentPositions,
            G.checkpointPositions,
            G.currentOverflowPositions,
            col,
            ctx.currentPlayer,
        );
        G.currentPositions[col] = newPos;
        G.currentOverflowPositions[col] = overflowPos;
    });

    goToStage(G, events, ctx, "rolling");
    // events.setActivePlayers({ all: "rolling" });
};

const addToCurrentPositions = (
    currentPositions: Positions,
    checkpointPositions: CheckpointPositions,
    currentOverflowPositions: Positions,
    column: number,
    playerID: string,
): [number, number] => {
    const over =
        currentPositions[column] == MAX_POSITION ||
        checkpointPositions[playerID][column] == MAX_POSITION;

    let newPos;
    const increase = over ? 0 : 1;
    if (currentPositions[column] != null) {
        newPos = currentPositions[column] + increase;
    } else {
        const playerCheckpoint = checkpointPositions[playerID];
        const checkpoint =
            playerCheckpoint == null ? 0 : playerCheckpoint[column] || 0;
        newPos = checkpoint + increase;
    }

    let newOverflowPos = currentOverflowPositions[column] || 0;
    if (over) {
        newOverflowPos = newOverflowPos + 1;
    }

    return [newPos, newOverflowPos];
};

export const currentWinners = (
    G: DiceyDartsGameState,
    currentPlayer: string,
): string[] => {
    const playerScores = calculateCurrentPlayerScores(
        G.currentOverflowPositions,
        G.checkpointPositions,
        G.playerScores,
        currentPlayer,
    );
    const minScore = _.minBy(_.values(playerScores), (score) => score);
    if (minScore == null) {
        return _.keys(playerScores);
    }
    return _.chain(playerScores)
        .pickBy((score) => score === minScore)
        .keys()
        .value();
};

export const checkEndGame = (G: DiceyDartsGameState) => {
    // End if a player has 5 max positions.
    let gameOver = false;
    _.forEach(G.checkpointPositions, (checkpointPositions) => {
        if (
            _.chain(checkpointPositions)
                .pickBy((position) => position === MAX_POSITION)
                .size()
                .value() >= NUM_SUMS_TO_END_GAME
        ) {
            gameOver = true;
        }
    });
    return gameOver;
};

export const oddsCalculator = getOddsCalculator(NUM_DICE, DICE_SIDES);

const setupGame = (): DiceyDartsGameState => {
    return {
        playerScores: {},
        currentOverflowPositions: {},
        checkpointPositions: {},
        diceSumOptions: undefined,
        currentPositions: {},
        diceValues: [],
        moveHistory: [],
        gameEndState: undefined,
        playerInfos: {},
        passAndPlay: false,
    };
};

const setupExistingGame = (G: DiceyDartsGameState) => {
    const keepFields = [
        "playerInfos",
        "numPlayers",
        "passAndPlay",
        // "numVictories",
        // "numColsToWin",
        // "showProbs",
        // "mountainShape",
        // "sameSpace",
    ];

    // // Create an object like G but with only the fields to keep.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const GFields: Array<keyof DiceyDartsGameState> = _.keys(G) as any;
    const GKeepFields = GFields.filter((key) => keepFields.indexOf(key) >= 0);
    const GKeep = GKeepFields.reduce(
        (G2, key) =>
            Object.assign(G2, {
                [key]: G[key],
            }),
        {},
    );

    Object.assign(G, setupGame(), GKeep);
};

/*
 * Go to a given stage but taking into account the passAndPlay mode.
 */
const goToStage = (
    G: DiceyDartsGameState,
    events: Parameters<MoveFn<DiceyDartsGameState>>[0]["events"],
    ctx: Ctx,
    newStage: string,
): void => {
    const activePlayers =
        G.passAndPlay || ctx.phase !== "playing"
            ? { all: newStage }
            : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              { currentPlayer: newStage, others: "waitingForTurn" };
    events.setActivePlayers(activePlayers);
};

export const DiceyDartsGame: Game<DiceyDartsGameState> = {
    name: "dicey-darts",
    setup: setupGame,

    phases: {
        configuringGame: {
            start: true,
            next: "playing",
            turn: {
                onBegin: ({ events }) => {
                    events.setActivePlayers({ all: "setup" });
                },
                stages: {
                    setup: {
                        moves: {
                            ...alwaysAvailableMoves,
                            startPlaying: (
                                { G, events },
                                playerInfos: PlayerInfos,
                            ) => {
                                events.endPhase();
                                G.playerInfos = playerInfos;
                            },
                            addPlayerInfo: ({ G }, playerInfo: PlayerInfo) => {
                                G.playerInfos[playerInfo.id] = playerInfo;
                            },
                            removePlayerInfo: ({ G }, playerId: string) => {
                                delete G.playerInfos[playerId];
                            },
                            setPlayerName: (
                                { G },
                                playerId: string,
                                name: string,
                            ) => {
                                G.playerInfos[playerId].name = name;
                            },
                        },
                    },
                },
            },
        },
        playing: {
            onBegin: ({ G }) => {
                const playerScores: DiceyDartsGameState["playerScores"] = {};
                const checkpointPositions: DiceyDartsGameState["checkpointPositions"] =
                    {};

                _.forEach(G.playerInfos, (_, playerId) => {
                    playerScores[playerId] = 0;
                    checkpointPositions[playerId] = {};
                });

                G.playerScores = playerScores;
                G.checkpointPositions = checkpointPositions;
            },
            // start: true,
            next: "gameEnd",
            turn: {
                order: {
                    first: () => 0,
                    next: ({ ctx, G }) =>
                        (ctx.playOrderPos + 1) % _.size(G.playerInfos),
                    playOrder: ({ G, random }) => {
                        // Take the actual number of players, and randomize amongst them.
                        let playOrder = _.keys(G.playerInfos).map((_, i) =>
                            i.toString(),
                        );
                        // TODO move 1 back for the 2nd game and more.
                        playOrder = random.Shuffle(playOrder);
                        return playOrder;
                    },
                },
                onBegin: ({ G, events, ctx }) => {
                    G.currentPositions = {};
                    G.currentOverflowPositions = {};
                    goToStage(G, events, ctx, "rolling");
                    // events.setActivePlayers({ all: "rolling" });

                    // G.currentPlayerHasStarted = false;
                    // updateBustProb(G, /* endOfTurn */ true);
                },
                stages: {
                    waitingForTurn: {
                        moves: {
                            ...alwaysAvailableMoves,
                        },
                    },
                    rolling: {
                        moves: {
                            ...alwaysAvailableMoves,
                            rollDice,
                            stop: ({ G, ctx, events }) => {
                                if (_.size(G.currentPositions) === 0) {
                                    return INVALID_MOVE;
                                }
                                G.diceSumOptions = undefined;
                                // Save current positions as checkpoints.
                                Object.entries(G.currentPositions).forEach(
                                    ([diceSumStr, step]) => {
                                        const diceSum = parseInt(diceSumStr);
                                        G.checkpointPositions[
                                            ctx.currentPlayer
                                        ][diceSum] = step;
                                    },
                                );
                                G.playerScores = calculateCurrentPlayerScores(
                                    G.currentOverflowPositions,
                                    G.checkpointPositions,
                                    G.playerScores,
                                    ctx.currentPlayer,
                                );

                                // Check if we should end the game,
                                if (checkEndGame(G)) {
                                    // Game is over. Whoever has the highest playerScore wins.
                                    const winners = currentWinners(
                                        G,
                                        ctx.currentPlayer,
                                    );
                                    if (winners.length > 1) {
                                        G.gameEndState = { draw: true };
                                    } else {
                                        G.gameEndState = { winner: winners[0] };
                                    }
                                    events.endPhase();
                                    // Clean the board a bit.
                                    // G.currentPositions = {};
                                    // G.info = {
                                    //     code: "win",
                                    //     playerID: ctx.currentPlayer,
                                    //     ts: new Date().getTime(),
                                    // };
                                    // G.numVictories[ctx.currentPlayer] += 1;
                                    // ctx.events.endPhase();
                                    // } else {
                                    // G.info = {
                                    //     code: "stop",
                                    //     playerID: ctx.currentPlayer,
                                    //     ts: new Date().getTime(),
                                    // };
                                } else {
                                    events.endTurn();
                                }
                            },
                        },
                    },
                    selecting: {
                        moves: {
                            ...alwaysAvailableMoves,
                            selectDice,
                        },
                    },
                },
            },
        },
        gameEnd: {
            turn: {
                onBegin: ({ G, events }) => {
                    G.currentPositions = {};
                    G.currentOverflowPositions = {};
                    events.setActivePlayers({ all: "gameover" });
                },
                // Make sure the order doesn't change when it's gameover. We'll change it at the
                // beginning of a new game.
                order: {
                    first: ({ ctx }) => ctx.playOrderPos,
                    next: () => 0,
                    playOrder: ({ ctx }) => ctx.playOrder,
                },
                stages: {
                    gameover: {
                        moves: {
                            playAgain: ({ G, events }) => {
                                setupExistingGame(G);
                                events.setPhase("playing");
                            },
                            ...alwaysAvailableMoves,
                        },
                    },
                },
            },
        },
    },

    ai: {
        enumerate: (G, ctx, playerId): AiEnumerate => {
            if (ctx.activePlayers?.[playerId] == "rolling") {
                if (_.size(G.currentPositions) === 0) {
                    return [{ move: "rollDice" }];
                }
                return [
                    { move: "rollDice" },
                    { move: "rollDice" },
                    { move: "stop" },
                ];
            } else if (ctx.activePlayers?.[playerId] == "selecting") {
                const diceSumOptions = G.diceSumOptions;
                if (diceSumOptions == null) {
                    throw new Error("assert false");
                }
                const moves: AiEnumerate = [];
                diceSumOptions.forEach((sumOption, diceSplitIndex) => {
                    const numDiceEnabled = diceSumOptions[
                        diceSplitIndex
                    ].enabled.filter((x) => x).length;
                    if (numDiceEnabled == 0) {
                        return;
                    }
                    if (isSumOptionSplit(sumOption)) {
                        sumOption.enabled.forEach((enabled, choiceIndex) => {
                            if (enabled) {
                                moves.push({
                                    move: "selectDice",
                                    args: [diceSplitIndex, choiceIndex],
                                });
                            }
                        });
                    } else {
                        moves.push({
                            move: "selectDice",
                            args: [diceSplitIndex],
                        });
                    }
                });
                return moves;
            }

            return [];
        },
    },
};
