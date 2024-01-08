import { BoardProps } from "boardgame.io/react";
import { GameMoves, MyGameState } from "../../Game";
import { GameActions } from "../GameActions/GameActions";
import { CheckpointsTable } from "../CheckpointsTable/CheckpointsTable";

export type MyGameBoardProps = BoardProps<MyGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    console.log("G", props);
    const { ctx, moves, G } = props;

    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        return (
            <div className="flex flex-col gap-8 text-lg">
                {/* Show Checkpoint and Current Positions */}
                <div className="flex justify-center">
                    <CheckpointsTable
                        G={G}
                        currentPlayerId={ctx.currentPlayer}
                    />
                </div>
                <div className="flex gap-8">
                    <div className="grid grid-cols-2">
                        {G.diceValues.map((diceValue, i) => {
                            return (
                                <div className="p-2" key={i}>
                                    {diceValue}
                                </div>
                            );
                        })}
                    </div>
                    <GameActions
                        activePlayers={ctx.activePlayers}
                        currentPlayer={ctx.currentPlayer}
                        moves={moves as GameMoves}
                        diceSumOptions={G.diceSumOptions}
                    />
                </div>
            </div>
        );
    }

    return <div>Starting Game...</div>;
};
