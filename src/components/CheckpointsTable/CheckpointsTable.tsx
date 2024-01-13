import _ from "lodash";
import { MAX_POSITION, SUM_SCORES } from "../../constants";
import { MyGameState } from "../../Game";
import { twMerge } from "tailwind-merge";
import Icon from "@mdi/react";
import {
    mdiCircleMedium,
    mdiRecordCircleOutline,
    mdiBullseyeArrow,
} from "@mdi/js";
import { ReactNode } from "react";

const PLAYER_COLORS = ["info", "error", "success", "warning"];
const PLAYER_TEXT_COLORS = PLAYER_COLORS.map((color) => `text-${color}`);

const insertEvery2Indexes = (array: string[], insertString: string) =>
    _.flatMap(array, (value, index) => {
        return (index + 1) % 2 === 0 ? [value] : [insertString, value];
    });

export const CheckpointsTable = ({
    G,
    currentPlayerId,
}: {
    G: MyGameState;
    currentPlayerId: string;
}) => {
    const playerIds = _.keys(G.checkpointPositions);
    const tableIds = playerIds.slice(0, 4);
    // In order to place the target column in the middle, if there are only 2 players
    const tablesSliced = tableIds.slice(0, tableIds.length / 2);
    const tablePlayerIdHeaders = tablesSliced.concat(
        insertEvery2Indexes(playerIds.slice(tableIds.length / 2), "Target"),
    );
    const playerIdIndex = (i: number) => {
        const playerId = tablePlayerIdHeaders[i];
        return playerIds.indexOf(playerId);
    };

    const sortedSums = _.chain(SUM_SCORES)
        .keys()
        .sort((a, b) => parseInt(b) - parseInt(a))
        .value();
    const tableRowData = sortedSums.map((sum) => {
        return tablePlayerIdHeaders.map((playerId) => {
            if (playerId === "Target") {
                return sum;
            } else {
                const isCurrentPlayer = playerId === currentPlayerId;
                return (
                    (isCurrentPlayer ? G.currentPositions[sum] || 0 : 0) ||
                    G.checkpointPositions[playerId][sum] ||
                    0
                );
            }
        });
    });
    return (
        <div className="overflow-x-auto">
            <table className="table table-sm md:table-md my-0 font-semibold text-center">
                <thead className="">
                    <tr>
                        {tablePlayerIdHeaders.map((playerId, i) => {
                            const isCurrentPlayer =
                                playerId === currentPlayerId;
                            const playerIndex = playerIdIndex(i);
                            const playerTextColor =
                                PLAYER_TEXT_COLORS[playerIndex % 4];
                            const innerEl =
                                playerId === "Target" ? (
                                    ""
                                ) : (
                                    <h2
                                        className={twMerge(
                                            "my-0 flex flex-col",
                                        )}
                                    >
                                        <span
                                            className={twMerge(
                                                "my-0",
                                                playerTextColor,
                                            )}
                                        >
                                            Player {playerId}
                                        </span>

                                        <span className="flex justify-around">
                                            <span>
                                                +
                                                {G.currentPlayerScores[
                                                    playerId
                                                ] - G.playerScores[playerId]}
                                            </span>
                                            <span>
                                                {
                                                    G.currentPlayerScores[
                                                        playerId
                                                    ]
                                                }
                                            </span>
                                        </span>
                                        <span className="flex justify-center text-sm items-center gap-px">
                                            {_.values(
                                                isCurrentPlayer
                                                    ? G.currentPositions
                                                    : G.checkpointPositions[
                                                          playerId
                                                      ],
                                            ).reduce(
                                                (total, pos) =>
                                                    pos === MAX_POSITION
                                                        ? total + 1
                                                        : total,
                                                0,
                                            )}
                                            /5{" "}
                                            <Icon
                                                path={mdiBullseyeArrow}
                                                size={0.6}
                                            />
                                        </span>
                                    </h2>
                                );

                            return (
                                <th
                                    key={i}
                                    scope="col"
                                    className={twMerge(
                                        isCurrentPlayer &&
                                            "border-b-4 border-accent",
                                    )}
                                >
                                    {innerEl}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {tableRowData.map((rowData, i) => {
                        const sum = sortedSums[i];
                        return (
                            <tr key={i}>
                                {rowData.map((data, j) => {
                                    const isTarget =
                                        tablePlayerIdHeaders[j] === "Target";
                                    let dataNode: ReactNode = data;
                                    const playerIndex = playerIdIndex(j);
                                    const playerTextColor =
                                        PLAYER_TEXT_COLORS[playerIndex % 4];
                                    if (!isTarget) {
                                        if (data === 3) {
                                            dataNode = (
                                                <Icon
                                                    path={mdiBullseyeArrow}
                                                    className={twMerge(
                                                        playerTextColor,
                                                    )}
                                                    size={1}
                                                />
                                            );
                                        } else if (data === 2) {
                                            dataNode = (
                                                <Icon
                                                    path={
                                                        mdiRecordCircleOutline
                                                    }
                                                    className={twMerge(
                                                        playerTextColor,
                                                    )}
                                                    size={1}
                                                />
                                            );
                                        } else if (data === 1) {
                                            dataNode = (
                                                <Icon
                                                    path={mdiCircleMedium}
                                                    className={twMerge(
                                                        playerTextColor,
                                                    )}
                                                    size={1}
                                                />
                                            );
                                        } else {
                                            dataNode = "";
                                        }
                                    }
                                    return (
                                        <td
                                            key={j}
                                            className={twMerge(
                                                "text-lg md:text-2xl",
                                                !isTarget && isTarget
                                                    ? "text-gray-400"
                                                    : "",
                                                G.currentPositions[sum] !==
                                                    undefined &&
                                                    isTarget &&
                                                    "text-primary-content bg-primary rounded-xl",
                                            )}
                                        >
                                            <span
                                                className={twMerge(
                                                    "flex justify-center",
                                                    G.currentPositions[sum] !==
                                                        undefined &&
                                                        isTarget &&
                                                        "",
                                                )}
                                            >
                                                {dataNode}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
