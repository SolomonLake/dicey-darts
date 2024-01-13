import { BoardProps } from "boardgame.io/react";
import { GameMoves, MyGameState } from "../../Game";
import { GameActions } from "../GameActions/GameActions";
import { CheckpointsTable } from "../CheckpointsTable/CheckpointsTable";
import { twMerge } from "tailwind-merge";

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
                            {G.diceValues.length > 0 && (
                                <div className="grid grid-cols-2 flex-1 gap-3">
                                    {G.diceValues.map((diceValue, i) => {
                                        const topHalf =
                                            i < G.diceValues.length / 2;
                                        return (
                                            <div
                                                key={i}
                                                className={twMerge(
                                                    "mask mask-triangle text-2xl flex justify-center items-center bg-accent text-accent-content aspect-[174/149]",
                                                    topHalf && "self-end",
                                                )}
                                            >
                                                <span className="pt-4">
                                                    {diceValue}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <GameActions
                                activePlayers={ctx.activePlayers}
                                currentPlayer={ctx.currentPlayer}
                                moves={moves as GameMoves}
                                diceSumOptions={G.diceSumOptions}
                                currentPositions={G.currentPositions}
                                className="flex-1 flex justify-center gap-3"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <div>Starting Game...</div>;
};
