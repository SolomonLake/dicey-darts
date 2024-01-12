import { BoardProps } from "boardgame.io/react";
import { GameMoves, MyGameState } from "../../Game";
import { GameActions } from "../GameActions/GameActions";
import { CheckpointsTable } from "../CheckpointsTable/CheckpointsTable";
import triangleSvg from "../../assets/triangle.svg?url";
import { twMerge } from "tailwind-merge";

export type MyGameBoardProps = BoardProps<MyGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    const { ctx, moves, G } = props;

    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        return (
            <div className="flex flex-col gap-4 h-full">
                {/* Show Checkpoint and Current Positions */}
                <div className="flex justify-center">
                    <CheckpointsTable
                        G={G}
                        currentPlayerId={ctx.currentPlayer}
                    />
                </div>
                <div className="flex justify-center flex-1 items-end">
                    <div className="flex gap-4 flex-1 justify-center max-w-lg max-h-72 h-full">
                        {G.diceValues.length > 0 && (
                            <div className="grid grid-cols-2 flex-1">
                                {G.diceValues.map((diceValue, i) => {
                                    return (
                                        <div
                                            style={{
                                                maskImage: `url(${triangleSvg})`,
                                            }}
                                            className={twMerge(
                                                "p-2 text-2xl flex justify-center items-center bg-accent text-accent-content",
                                            )}
                                            key={i}
                                        >
                                            {diceValue}
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
        );
    }

    return <div>Starting Game...</div>;
};
