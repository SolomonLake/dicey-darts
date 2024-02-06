import _ from "lodash";
import { GameMoves, PlayerInfo, PlayerInfos } from "../Game";
import { MyGameBoardProps } from "./DiceyDartsBoard";
import { GameButton } from "./GameButton";
import { useEffect, useMemo, useState } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiPlus } from "@mdi/js";

export const ConfiguringGame = (props: MyGameBoardProps) => {
    const { G, moves, matchData } = props;
    const gameMoves = moves as GameMoves;

    const playersData = matchData as PlayerInfo[];

    const onlinePlayerData = useMemo(
        () => _.filter(playersData, ({ data }) => !!data?.joined),
        [playersData],
    );
    const playerInfos = _.values(G.playerInfos);

    useEffect(() => {
        if (!G.passAndPlay) {
            onlinePlayerData.forEach((player) => {
                if (!playerInfos[player.id]) {
                    gameMoves.addPlayerInfo({ id: player.id });
                }
            });
            _.forEach(playerInfos, (_, i) => {
                if (!onlinePlayerData[i]?.data?.joined) {
                    gameMoves.removePlayerInfo(i.toString());
                }
            });
        }
    }, [playerInfos, G.passAndPlay, onlinePlayerData, gameMoves]);

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
                    className="w-full"
                >
                    Start Game
                </GameButton>
                <div className="flex flex-col gap-2">
                    {playerInfos.map((_, i) => (
                        <div key={i} className="flex gap-1">
                            <input
                                type="text"
                                placeholder={`Player ${i + 1}`}
                                value={playerInfos[i]?.name}
                                onChange={(e) => {
                                    gameMoves.setPlayerName(
                                        i.toString(),
                                        e.target.value,
                                    );
                                    // setModifiedPlayerInfos((prev) => {
                                    //     const newInfos = [...prev];
                                    //     newInfos[i] = {
                                    //         name: e.target.value,
                                    //         id: i,
                                    //     };
                                    //     return newInfos;
                                    // });
                                }}
                                className="input input-bordered input-accent w-full max-w-sm"
                            />
                            {G.passAndPlay && (
                                <button
                                    onClick={() => {
                                        // setModifiedPlayerInfos((prev) => {
                                        //     const newInfos = [...prev];
                                        //     newInfos.splice(i, 1);
                                        //     return newInfos;
                                        // });
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
                            // setModifiedPlayerInfos((prev) => {
                            //     const newInfos = [...prev];
                            //     newInfos.push({
                            //         name: "",
                            //         id: newInfos.length,
                            //     });
                            //     return newInfos;
                            // });
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
