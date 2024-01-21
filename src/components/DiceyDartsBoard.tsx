import { BoardProps } from "boardgame.io/react";
import {
    GameMoves,
    DiceyDartsGameState,
    currentWinners,
    TurnPhase,
    PlayerInfos,
    PlayerInfo,
} from "../Game";
import { GameActions } from "./GameActions";
import { CheckpointsTable } from "./CheckpointsTable";
import { GameButton } from "./GameButton";
import _ from "lodash";
import { getBlockedSums } from "../diceSumOptions";
import { completedSums } from "../utils/completedSums";
import { NUM_SUMS_TO_END_GAME } from "../constants";
import { useState } from "react";

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
    const winnerName = G.playerInfos[parseInt(winnerId || "0")];

    const [playerInfos, setPlayerInfos] = useState<PlayerInfo[]>(
        new Array(ctx.numPlayers).fill({ name: "" }),
    );

    if (ctx.phase === "configuringGame") {
        return (
            <div className="h-full flex justify-center">
                <div className="max-w-lg flex-col flex gap-3">
                    <div className="flex justify-center flex-col gap-5 pt-8">
                        <GameButton
                            onClick={() => {
                                const finalInfos = _.map(
                                    playerInfos,
                                    (info, i) => ({
                                        name: info?.name || `Player ${i + 1}`,
                                    }),
                                ).reduce((acc, info, i) => {
                                    acc[i] = info;
                                    return acc;
                                }, {} as PlayerInfos);
                                gameMoves.startPlaying(finalInfos);
                            }}
                        >
                            Start Game
                        </GameButton>
                        <div className="flex flex-col gap-2">
                            {new Array(ctx.numPlayers)
                                .fill(null)
                                .map((_, i) => (
                                    <div key={i}>
                                        <input
                                            type="text"
                                            placeholder={`Player ${i + 1}`}
                                            onChange={(e) => {
                                                setPlayerInfos({
                                                    ...playerInfos,
                                                    [i]: {
                                                        name: e.target.value,
                                                    },
                                                });
                                            }}
                                            className="input input-bordered w-full max-w-xs"
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        {G.gameEndState && ctx.phase === "gameEnd" ? (
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
