import { BoardProps } from "boardgame.io/react";
import {
    GameMoves,
    DiceyDartsGameState,
    currentWinners,
    TurnPhase,
} from "../Game";
import { GameActions } from "./GameActions";
import { CheckpointsTable } from "./CheckpointsTable";
import { GameButton } from "./GameButton";
import _ from "lodash";
import { getBlockedSums } from "../diceSumOptions";
import { completedSums } from "../utils/completedSums";
import { NUM_SUMS_TO_END_GAME } from "../constants";

export type MyGameBoardProps = BoardProps<DiceyDartsGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    const { ctx, moves, G } = props;

    const [blockedSums] = getBlockedSums({
        currentPositions: G.currentPositions,
        checkpointPositions: G.checkpointPositions,
        numPlayers: ctx.numPlayers,
        currentPlayer: ctx.currentPlayer,
    });
    const allCurrentPositionsBlocked = _.reduce(
        G.currentPositions,
        (allBlocked, _, sum) => {
            return allBlocked && blockedSums.has(parseInt(sum));
        },
        true,
    );
    const winnerId: string | undefined = G.gameEndState?.winner;

    const gameEndWarning =
        completedSums(G, ctx.currentPlayer, true) === NUM_SUMS_TO_END_GAME &&
        !currentWinners(G).includes(ctx.currentPlayer);

    const gameMoves = moves as GameMoves;
    const PLAYER_NAMES = ["Lake", "Irving", "Kate", "Alan"];
    const winnerName = PLAYER_NAMES[parseInt(winnerId || "0")];

    return (
        <div className="h-full flex justify-center">
            <div className="max-w-2xl flex-col flex gap-3">
                {/* Show Checkpoint and Current Positions */}
                <div className="flex justify-center">
                    <CheckpointsTable
                        G={G}
                        numPlayers={ctx.numPlayers}
                        currentPlayerId={ctx.currentPlayer}
                    />
                </div>
                <div className="flex justify-center flex-1 items-end">
                    <div className="flex gap-4 flex-1 justify-center max-h-72 h-full">
                        {G.gameEndState ? (
                            <div className="flex justify-center gap-3 flex-col">
                                {winnerId ? (
                                    <h2 className="text-4xl my-0">
                                        {winnerName} Won!
                                    </h2>
                                ) : (
                                    <h2 className="text-4xl my-0">
                                        Game Over: Draw
                                    </h2>
                                )}

                                <GameButton
                                    onClick={() => {
                                        gameMoves.playAgain();
                                    }}
                                >
                                    New Game
                                </GameButton>
                            </div>
                        ) : (
                            <GameActions
                                currentPlayer={ctx.currentPlayer}
                                moves={gameMoves}
                                diceSumOptions={G.diceSumOptions}
                                diceValues={G.diceValues}
                                currentPositions={G.currentPositions}
                                allCurrentPositionsBlocked={
                                    allCurrentPositionsBlocked
                                }
                                turnPhase={
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    ctx.activePlayers?.[ctx.currentPlayer] as
                                        | TurnPhase
                                        | undefined
                                }
                                wasBust={
                                    !!G.moveHistory[G.moveHistory.length - 1]
                                        ?.bust
                                }
                                gameEndWarning={gameEndWarning}
                                className="flex-1 flex justify-center gap-3 max-w-lg"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return <div>Starting Game...</div>;
};
