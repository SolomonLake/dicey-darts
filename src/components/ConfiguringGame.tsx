import _ from "lodash";
import { GameMoves, PlayerInfos } from "../Game";
import { MyGameBoardProps } from "./DiceyDartsBoard";
import { GameButton } from "./GameButton";
import { useEffect } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiPlus } from "@mdi/js";

export const ConfiguringGame = (props: MyGameBoardProps) => {
    const { G, moves, playerID: playerId } = props;
    const gameMoves = moves as GameMoves;

    const playerInfos = _.values(G.playerInfos);

    useEffect(() => {
        if (!G.passAndPlay && playerId && !G.playerInfos[playerId]) {
            gameMoves.addPlayerInfo({ id: parseInt(playerId) });
        }
    }, [G.passAndPlay, gameMoves, G.playerInfos, playerId]);

    return (
        <div className="max-w-lg flex-col flex gap-3">
            <div className="flex justify-center flex-col gap-5 pt-8 items-center">
                <GameButton
                    onClick={() => {
                        const finalInfos = _.map(playerInfos, (info, i) => ({
                            name: info?.name || `Player ${i + 1}`,
                            id: i,
                        })).reduce((acc: PlayerInfos, info, i) => {
                            acc[i] = info;
                            return acc;
                        }, {});
                        gameMoves.startPlaying(finalInfos);
                    }}
                    className="w-fit"
                >
                    Start Game
                </GameButton>
                <label className="label flex gap-2">
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={props.G.passAndPlay}
                        onChange={(e) => {
                            gameMoves.setPassAndPlay(e.target.checked);
                        }}
                    />
                    Single-player
                </label>
                <div className="flex flex-col gap-2">
                    {playerInfos.map((_, i) => (
                        <div key={i} className="flex gap-1">
                            <input
                                type="text"
                                placeholder={`Player ${i + 1}`}
                                value={playerInfos[i]?.name}
                                disabled={
                                    playerInfos[i]?.id !==
                                        parseInt(playerId || "") &&
                                    !G.passAndPlay
                                }
                                onChange={(e) => {
                                    gameMoves.setPlayerName(
                                        i.toString(),
                                        e.target.value,
                                    );
                                }}
                                className="input input-bordered input-accent w-full max-w-sm"
                            />
                            {G.passAndPlay && (
                                <button
                                    onClick={() => {
                                        gameMoves.removePlayerInfo(
                                            i.toString(),
                                        );
                                    }}
                                    className="btn btn-circle btn-ghost"
                                >
                                    <Icon
                                        path={mdiClose}
                                        size={1}
                                        className="text-2xl"
                                    />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {G.passAndPlay && (
                    <GameButton
                        onClick={() => {
                            gameMoves.addPlayerInfo({
                                id: playerInfos.length,
                            });
                        }}
                        className="btn-accent w-fit"
                    >
                        <Icon path={mdiPlus} size={1} />
                        Add Player
                    </GameButton>
                )}
            </div>
        </div>
    );
};
