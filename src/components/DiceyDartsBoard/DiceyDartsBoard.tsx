import { BoardProps } from "boardgame.io/react";
import { GameMoves, MyGameState } from "../../Game";
import { GameActions } from "../GameActions/GameActions";
import { CheckpointsTable } from "../CheckpointsTable/CheckpointsTable";
import { twMerge } from "tailwind-merge";
import { GameButton } from "../DiceyButton/GameButton";
import _ from "lodash";

export type MyGameBoardProps = BoardProps<MyGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    const { ctx, moves, G } = props;

    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        return (
            <div className="h-full flex justify-center">
                <div className="max-w-lg flex-col flex gap-4">
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
                                    <h2 className="text-4xl my-0">
                                        Player {ctx.gameover.winner} Won!
                                    </h2>
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
                                    allCurrentPositionsBlocked={_.reduce(
                                        G.currentPositions,
                                        (allBlocked, _, sum) => {
                                            return allBlocked || false; // TODO: use blockded sums
                                        },
                                        true,
                                    )}
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
