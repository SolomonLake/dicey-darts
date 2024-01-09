import type { AiEnumerate, Game, MoveFn } from "boardgame.io";
import { EventsAPI } from "boardgame.io/dist/types/src/plugins/plugin-events";
import {
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
import { INVALID_MOVE } from "boardgame.io/core";

type PlayerMove = {
    // Values of the 4 dice.
    diceValues?: number[];
    //0=horzontal, 1=vertical, 2=diagonal
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

export interface MyGameState {
    checkpointPositions: CheckpointPositions;
    currentPositions: Positions;
    diceSumOptions?: DiceSumOptions;
    diceValues: number[];
    moveHistory: PlayerMove[];
    currentPlayerScores: PlayerScores;
    playerScores: PlayerScores;
}

export type GameMoves = {
    rollDice: () => void;
    stop: () => void;
    selectDice: (diceSplitIndex: number, choiceIndex?: number) => void;
};

const rollDice: MoveFn<MyGameState> = ({ G, random, ctx, events }) => {
    const diceValues = random.Die(DICE_SIDES, NUM_DICE);
    G.diceValues = diceValues;

    const move: PlayerMove = { diceValues, playerID: ctx.currentPlayer };
    G.diceSumOptions = getSumOptions(
        G.diceValues,
        G.currentPositions,
        G.checkpointPositions,
        ctx.currentPlayer,
        ctx.numPlayers,
    );
    const busted = G.diceSumOptions.every((sumOption: SumOption) =>
        sumOption.enabled.every((x) => !x),
    );
    if (busted) {
        G.currentPlayerScores = G.playerScores;
        events.endTurn();
        move.bust = true;
    } else {
        goToStage(events, "selecting");
    }
    G.moveHistory.push(move);
};

const selectDice: MoveFn<MyGameState> = (
    { G, events, ctx },
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
        const [newPos, newPlayerScores] = addToCurrentPositions(
            G.currentPositions,
            G.checkpointPositions,
            G.currentPlayerScores,
            col,
            ctx.currentPlayer,
        );
        G.currentPositions[col] = newPos;
        G.currentPlayerScores = newPlayerScores;
    });

    goToStage(events, "rolling");
};

const goToStage = (events: EventsAPI, newStage: string) => {
    // const activePlayers = G.passAndPlay
    //     ? { all: newStage }
    //     : { currentPlayer: newStage, others: Stage.NULL };
    events.setActivePlayers({ all: newStage });
};

const addToCurrentPositions = (
    currentPositions: Positions,
    checkpointPositions: CheckpointPositions,
    currentPlayerScores: PlayerScores,
    column: number,
    playerID: string,
): [number, PlayerScores] => {
    const over =
        currentPositions[column] == MAX_POSITION ||
        checkpointPositions[playerID][column] == MAX_POSITION;

    // For each scores, add the score to the player's score if they aren't at max position in that checkpoint
    const newScores = _.mapValues(
        currentPlayerScores,
        (score, playerIdScore) => {
            if (over) {
                // Player never gives score to themselves.
                if (playerIdScore === playerID) {
                    return score;
                }
                if (SUM_SCORES[column] == null) {
                    throw new Error("assert false");
                }
                const additionalScore: number = SUM_SCORES[column];
                const checkpoint = checkpointPositions[playerIdScore][column];
                return (
                    score + (checkpoint === MAX_POSITION ? 0 : additionalScore)
                );
            }
            return score;
        },
    );

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

    return [newPos, newScores];
};

const checkEndGame = (G: MyGameState, events: EventsAPI) => {
    // End if a player has 5 max positions.
    let gameOver = false;
    _.forEach(G.checkpointPositions, (checkpointPositions) => {
        if (
            _.chain(checkpointPositions)
                .pickBy((position) => position === MAX_POSITION)
                .size()
                .value() === NUM_SUMS_TO_END_GAME
        ) {
            gameOver = true;
            // Game is over. Whoever has the highest playerScore wins.
            const playerScores = G.playerScores;
            const minScore = _.minBy(_.values(playerScores), (score) => score);
            if (minScore == null) {
                events.endGame({ draw: true });
            }
            const winners = _.chain(G.playerScores)
                .pickBy((score) => score === minScore)
                .keys()
                .value();
            if (winners.length > 1) {
                events.endGame({ draw: true });
            } else {
                events.endGame({ winner: winners[0] });
            }
        }
    });
    return gameOver;
};

export const oddsCalculator = getOddsCalculator(NUM_DICE, DICE_SIDES);

export const DiceyDarts: Game<MyGameState> = {
    name: "dicey-darts",
    setup: ({ ctx }) => {
        const playerScores: MyGameState["playerScores"] = {};
        const checkpointPositions: MyGameState["checkpointPositions"] = {};
        const currentPlayerScores: MyGameState["currentPlayerScores"] = {};

        for (let i = 0; i < ctx.numPlayers; ++i) {
            const playerId = "" + i;
            playerScores[playerId] = 0;
            checkpointPositions[playerId] = {};
            currentPlayerScores[playerId] = 0;
        }

        return {
            playerScores,
            currentPlayerScores,
            checkpointPositions,
            currentPositions: {},
            diceValues: [],
            moveHistory: [],
        };
    },

    turn: {
        onBegin: ({ G, events }) => {
            G.currentPositions = {};
            goToStage(events, "rolling");

            // G.currentPlayerHasStarted = false;
            // updateBustProb(G, /* endOfTurn */ true);
        },
        stages: {
            rolling: {
                moves: {
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
                                G.checkpointPositions[ctx.currentPlayer][
                                    diceSum
                                ] = step;
                            },
                        );
                        G.playerScores = G.currentPlayerScores;

                        // Check if we should end the game,
                        if (!checkEndGame(G, events)) {
                            //     events.endGame({ winner: ctx.currentPlayer });
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
                            events.endTurn();
                        }
                    },
                },
            },
            selecting: {
                moves: {
                    selectDice,
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