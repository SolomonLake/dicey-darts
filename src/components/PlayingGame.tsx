import _ from "lodash";
import { getBlockedSums } from "../diceSumOptions";
import { MyGameBoardProps } from "./DiceyDartsBoard";
import { NUM_DICE_CHOICE, NUM_SUMS_TO_END_GAME } from "../constants";
import { completedSums } from "../utils/completedSums";
import { GameMoves, TurnPhase, currentWinners } from "../Game";
import { CheckpointsTable } from "./CheckpointsTable";
import { GameButton } from "./GameButton";
import { GameActions } from "./GameActions";

export const PlayingGame = (props: MyGameBoardProps) => {
    const { ctx, moves, G, playerID: playerId } = props;

    const [blockedSums] = getBlockedSums({
        currentPositions: G.currentPositions,
        checkpointPositions: G.checkpointPositions,
        numPlayers: _.size(G.playerInfos),
        currentPlayer: ctx.currentPlayer,
    });
    const numCurrentPositionsBlocked: number = _.reduce(
        G.currentPositions,
        (numBlocked, _, sum) => {
            return blockedSums.has(parseInt(sum)) ? numBlocked + 1 : numBlocked;
        },
        0,
    );
    const numCurrentPositions = _.size(G.currentPositions);
    const allCurrentPositionsBlocked =
        numCurrentPositionsBlocked >= NUM_DICE_CHOICE;
    const rollingOneAlert =
        numCurrentPositionsBlocked === NUM_DICE_CHOICE - 1 &&
        numCurrentPositions === NUM_DICE_CHOICE;
    const winnerId: string | undefined = G.gameEndState?.winner;

    const gameEndWarning =
        completedSums(G, ctx.currentPlayer, true) >= NUM_SUMS_TO_END_GAME &&
        !currentWinners(G, ctx.currentPlayer).includes(ctx.currentPlayer);
    const gameWinAlert =
        completedSums(G, ctx.currentPlayer, true) >= NUM_SUMS_TO_END_GAME &&
        currentWinners(G, ctx.currentPlayer).includes(ctx.currentPlayer);
    const gameMoves = moves as GameMoves;
    const winnerName = G.playerInfos[parseInt(winnerId || "0")]?.name;

    return (
        <div className="max-w-2xl flex-col flex gap-3">
            {/* Show Checkpoint and Current Positions */}
            <div className="flex justify-center">
                <CheckpointsTable
                    G={G}
                    ctx={ctx}
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
                            <GameButton
                                onClick={() => {
                                    gameMoves.configureGame();
                                }}
                            >
                                Change Game Settings
                            </GameButton>
                        </div>
                    ) : (
                        <GameActions
                            currentPlayer={ctx.currentPlayer}
                            playOrder={ctx.playOrder}
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
                                !!G.moveHistory[G.moveHistory.length - 1]?.bust
                            }
                            gameEndWarning={gameEndWarning}
                            gameWinAlert={gameWinAlert}
                            rollingOneAlert={rollingOneAlert}
                            className="flex-1 flex justify-center gap-3 max-w-lg"
                            activePlayers={ctx.activePlayers}
                            playerId={playerId || "0"}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
