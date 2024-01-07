import { BoardProps } from "boardgame.io/react";
import { GameMoves, MyGameState } from "../../Game";
import { GameActions } from "../GameActions/GameActions";

export type MyGameBoardProps = BoardProps<MyGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    console.log("G", props);
    const { ctx, moves, G } = props;
    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        return (
            <div>
                {/* Show Checkpoint and Current Positions */}
                <div>
                    <div>
                        Checkpoint: {JSON.stringify(G.checkpointPositions)}
                    </div>
                    <div>
                        Current Positions:
                        {JSON.stringify(G.currentPositions)}
                    </div>
                </div>
                <GameActions
                    activePlayers={ctx.activePlayers}
                    currentPlayer={ctx.currentPlayer}
                    moves={moves as GameMoves}
                    diceSumOptions={G.diceSumOptions}
                />
            </div>
        );
    }

    return <div>Starting Game...</div>;
};
