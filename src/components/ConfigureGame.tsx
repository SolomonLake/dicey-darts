import _ from "lodash";
import { GameMoves, PlayerInfo, PlayerInfos } from "../Game";
import { MyGameBoardProps } from "./DiceyDartsBoard";
import { GameButton } from "./GameButton";
import { useState } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiPlus } from "@mdi/js";

export const ConfigureGame = (props: MyGameBoardProps) => {
    const { G, moves } = props;
    const gameMoves = moves as GameMoves;
    // configuring game section -- Use something else for playerInfo?s
    const [playerInfos, setPlayerInfos] = useState<PlayerInfo[]>(
        _.values(G.playerInfos),
    );
    return (
        <div className="h-full flex justify-center">
            <div className="max-w-lg flex-col flex gap-3">
                <div className="flex justify-center flex-col gap-5 pt-8 items-center">
                    <GameButton
                        onClick={() => {
                            const finalInfos = _.map(
                                playerInfos,
                                (info, i) => ({
                                    name: info?.name || `Player ${i + 1}`,
                                }),
                            ).reduce((acc: PlayerInfos, info, i) => {
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
                                        setPlayerInfos((prev) => {
                                            const newInfos = [...prev];
                                            newInfos[i] = {
                                                name: e.target.value,
                                            };
                                            return newInfos;
                                        });
                                    }}
                                    className="input input-bordered input-accent w-full max-w-sm"
                                />
                                <button
                                    onClick={() => {
                                        setPlayerInfos((prev) => {
                                            const newInfos = [...prev];
                                            newInfos.splice(i, 1);
                                            return newInfos;
                                        });
                                    }}
                                    className="btn btn-circle btn-ghost"
                                >
                                    <Icon
                                        path={mdiClose}
                                        size={1}
                                        className="text-2xl"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                    <GameButton
                        onClick={() => {
                            setPlayerInfos((prev) => {
                                const newInfos = [...prev];
                                newInfos.push({ name: "" });
                                return newInfos;
                            });
                        }}
                        className="btn-accent w-fit"
                    >
                        <Icon path={mdiPlus} size={1} />
                        Add Player
                    </GameButton>
                </div>
            </div>
        </div>
    );
};
