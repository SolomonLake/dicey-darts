import { BoardProps } from "boardgame.io/react";
import {
    GameMoves,
    DiceyDartsGameState,
    currentWinners,
} from "../DiceyDartsGame";
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
    const winnerId: string | undefined =
        typeof ctx.gameover?.winner == "string"
            ? (ctx.gameover?.winner as string)
            : undefined;

    const gameEndWarning =
        completedSums(G, ctx.currentPlayer, true) === NUM_SUMS_TO_END_GAME &&
        !currentWinners(G).includes(ctx.currentPlayer);

    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        return (
            <div className="h-full flex justify-center">
                <div className="max-w-lg flex-col flex gap-3">
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
                            {ctx.gameover ? (
                                <div className="flex justify-center gap-3 flex-col">
                                    {winnerId ? (
                                        <h2 className="text-4xl my-0">
                                            Player {parseInt(winnerId) + 1} Won!
                                        </h2>
                                    ) : (
                                        <h2 className="text-4xl my-0">
                                            Game Over: Draw
                                        </h2>
                                    )}

                                    <GameButton>New Game</GameButton>
                                </div>
                            ) : (
                                <GameActions
                                    activePlayers={ctx.activePlayers}
                                    currentPlayer={ctx.currentPlayer}
                                    moves={moves as GameMoves}
                                    diceSumOptions={G.diceSumOptions}
                                    diceValues={G.diceValues}
                                    currentPositions={G.currentPositions}
                                    allCurrentPositionsBlocked={
                                        allCurrentPositionsBlocked
                                    }
                                    wasBust={
                                        !!G.moveHistory[
                                            G.moveHistory.length - 1
                                        ]?.bust
                                    }
                                    gameEndWarning={gameEndWarning}
                                    className="flex-1 flex justify-center gap-3"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <div>Starting Game...</div>;
};
