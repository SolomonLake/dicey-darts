import { BoardProps } from "boardgame.io/react";
import { GameMoves, MyGameState } from "../../Game";
import { GameActions } from "../GameActions/GameActions";
import { SUM_SCORES } from "../../constants";
import _ from "lodash";
import { twMerge } from "tailwind-merge";

export type MyGameBoardProps = BoardProps<MyGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    console.log("G", props);
    const { ctx, moves, G } = props;
    const sortedSums = _.chain(SUM_SCORES)
        .keys()
        .sort((a, b) => parseInt(b) - parseInt(a))
        .value();

    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        return (
            <div className="flex flex-col gap-8 text-lg">
                {/* Show Checkpoint and Current Positions */}
                <div className="flex justify-center">
                    <div className="flex flex-col pt-8">
                        {sortedSums.map((sum, i) => {
                            return (
                                <div key={i}>
                                    <span
                                        className={twMerge(
                                            G.currentPositions[sum] !==
                                                undefined && "text-red-500",
                                        )}
                                    >
                                        {sum}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {_.map(G.checkpointPositions, (positions, playerID) => {
                        const currentPlayer = playerID === ctx.currentPlayer;
                        return (
                            <div key={playerID}>
                                <div className="px-2">
                                    <h2
                                        className={twMerge(
                                            "mb-2",
                                            currentPlayer && "text-red-500",
                                        )}
                                    >
                                        Player {playerID}:{" ("}
                                        {G.playerScores[playerID]} +{" "}
                                        {G.currentPlayerScores[playerID] -
                                            G.playerScores[playerID]}
                                        {") = "}
                                        {G.currentPlayerScores[playerID]}
                                    </h2>
                                    {sortedSums.map((sum, i) => {
                                        const isCurrentPlayer =
                                            playerID === ctx.currentPlayer;
                                        const totalSum =
                                            positions[sum] ||
                                            0 +
                                                (isCurrentPlayer
                                                    ? G.currentPositions[sum] ||
                                                      0
                                                    : 0);
                                        return (
                                            <div key={i}>
                                                <span>{totalSum}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
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
