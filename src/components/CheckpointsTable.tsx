import _ from "lodash";
import { MAX_POSITION, SUM_SCORES } from "../constants";
import {
    DiceyDartsGameState,
    calculateCurrentPlayerScores,
    currentWinners,
} from "../Game";
import { twMerge } from "tailwind-merge";
import Icon from "@mdi/react";
import {
    mdiCircleMedium,
    mdiRecordCircleOutline,
    mdiBullseyeArrow,
    mdiCrownOutline,
    mdiPlus,
} from "@mdi/js";
import { ReactNode } from "react";
import { getBlockedSums } from "../diceSumOptions";
import { completedSums } from "../utils/completedSums";
import {
    PLAYER_BG_COLORS,
    PLAYER_BG_TEXT_COLORS,
    PLAYER_BORDER_COLORS,
    PLAYER_TEXT_COLORS,
    PLAYER_TEXT_CONTENT_BG_COLORS,
} from "../colorConstants";
import { Ctx } from "boardgame.io";

// const insertEvery2Indexes = (array: string[], insertString: string) =>
//     _.flatMap(array, (value, index) => {
//         return (index + 1) % 2 === 0 ? [value] : [insertString, value];
//     });

export const CheckpointsTable = ({
    G,
    ctx,
    currentPlayerId,
}: {
    G: DiceyDartsGameState;
    ctx: Ctx;
    currentPlayerId: string;
}) => {
    const playerIds = ctx.playOrder;
    // const tableIds = playerIds.slice(0, 4);
    // In order to place the target column in the middle, if there are only 2 players
    // const tablesSliced = tableIds.slice(0, tableIds.length / 2);
    // Insert "Target" in middle of array, closer to start if odd
    const half = Math.floor(playerIds.length / 2);
    const tablePlayerIdHeaders = [
        ...playerIds.slice(0, half),
        "Target",
        ...playerIds.slice(half),
    ];
    const playerIdIndex = (i: number) => {
        const playerId = tablePlayerIdHeaders[i];
        return playerIds.indexOf(playerId);
    };
    const [blockedSums] = getBlockedSums({
        currentPositions: G.currentPositions,
        checkpointPositions: G.checkpointPositions,
        numPlayers: _.size(G.playerInfos),
        currentPlayer: currentPlayerId,
    });

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
        <div className="">
            <table className="table table-fixed table-sm md:table-md my-0 font-semibold text-center">
                <thead className="">
                    <tr className="">
                        {tablePlayerIdHeaders.map((playerId, i) => {
                            const isCurrentPlayer =
                                playerId === currentPlayerId;
                            const playerIndex = playerIdIndex(i);
                            const playerTextColor =
                                PLAYER_BG_TEXT_COLORS[playerIndex % 4];
                            const playerBgColor =
                                PLAYER_BG_COLORS[playerIndex % 4];
                            const playerBorderColor =
                                PLAYER_BORDER_COLORS[playerIndex % 4];
                            const playerName = G.playerInfos[playerId]?.name;
                            const numCompletedSums = completedSums(
                                G,
                                playerId,
                                isCurrentPlayer,
                            );
                            const isWinning: boolean = currentWinners(
                                G,
                                currentPlayerId,
                            ).includes(playerId);
                            const isTarget = playerId === "Target";
                            const currentPlayerScore =
                                calculateCurrentPlayerScores(
                                    G.currentOverflowPositions,
                                    G.checkpointPositions,
                                    G.playerScores,
                                    currentPlayerId,
                                )[playerId];
                            const addedScore =
                                currentPlayerScore - G.playerScores[playerId];
                            const largeAddedScore = addedScore > 99;
                            return (
                                <th
                                    key={i}
                                    scope="col"
                                    className={twMerge(
                                        "px-1 align-top pb-0",
                                        isTarget && "w-6",
                                    )}
                                >
                                    {isTarget ? (
                                        ""
                                    ) : (
                                        <div
                                            className={twMerge(
                                                "relative",
                                                // isCurrentPlayer &&
                                                //     "border-b-8 border-primary pb-1",
                                            )}
                                        >
                                            {/* <div
                                                className={twMerge(
                                                    "absolute -bottom-3 w-full h-5 rounded-lg",
                                                )}
                                            /> */}
                                            {isWinning && (
                                                <Icon
                                                    path={mdiCrownOutline}
                                                    className="text-accent p-[2px] bg-base-100 rounded-full absolute -top-3 -left-2"
                                                    size={0.9}
                                                />
                                            )}
                                            <h2
                                                className={twMerge(
                                                    "my-0 flex flex-col rounded-lg px-2 h-full",
                                                    playerBgColor,
                                                    playerTextColor,
                                                    // isCurrentPlayer &&
                                                    //     "rounded-b-none",
                                                )}
                                            >
                                                <span
                                                    className={twMerge(
                                                        "my-0 truncate text-center",
                                                    )}
                                                >
                                                    {playerName}
                                                </span>

                                                <span
                                                    className={twMerge(
                                                        "flex justify-center gap-1 sm:gap-4 items-center",
                                                        largeAddedScore
                                                            ? "gap-1"
                                                            : "gap-2",
                                                    )}
                                                >
                                                    {addedScore > 0 && (
                                                        <span className="text-sm">
                                                            +{addedScore}
                                                        </span>
                                                    )}
                                                    <span className="text-md">
                                                        {currentPlayerScore}
                                                    </span>
                                                </span>
                                                <span className="flex justify-center text-sm items-center gap-px">
                                                    {numCompletedSums}
                                                    /5{" "}
                                                    <Icon
                                                        path={mdiBullseyeArrow}
                                                        size={0.6}
                                                    />
                                                </span>
                                            </h2>
                                        </div>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {tableRowData.map((rowData, i) => {
                        const sum = sortedSums[i];
                        const isSumBlocked = blockedSums.has(parseInt(sum));
                        return (
                            <tr
                                key={i}
                                className={twMerge(
                                    isSumBlocked && "bg-diagonal",
                                )}
                            >
                                {rowData.map((data, j) => {
                                    const isTarget =
                                        tablePlayerIdHeaders[j] === "Target";
                                    let dataNode: ReactNode = data;
                                    const playerIndex = playerIdIndex(j);
                                    const playerTextColor =
                                        PLAYER_TEXT_COLORS[playerIndex % 4];
                                    const playerTextContentBgColor =
                                        PLAYER_TEXT_CONTENT_BG_COLORS[
                                            playerIndex % 4
                                        ];
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
                                    const targetScore =
                                        SUM_SCORES[parseInt(sum)];
                                    const isTargetSelected =
                                        G.currentPositions[sum] !== undefined &&
                                        isTarget;
                                    const isCurrentPlayer =
                                        playerIds[playerIndex] ===
                                        currentPlayerId;
                                    const isLastRow =
                                        i === tableRowData.length - 1;
                                    const isFirstRow = i === 0;
                                    const amountOverTarget =
                                        G.currentOverflowPositions[sum];
                                    return (
                                        <td
                                            key={j}
                                            className={twMerge(
                                                "text-lg md:text-2xl",
                                                G.currentPositions[sum] !==
                                                    undefined &&
                                                    isTarget &&
                                                    "text-primary-content bg-primary rounded-sm",
                                                isSumBlocked && "opacity-40",
                                                isCurrentPlayer &&
                                                    "bg-base-200",
                                                !isTarget &&
                                                    isFirstRow &&
                                                    "rounded-t-lg",
                                                !isTarget &&
                                                    isLastRow &&
                                                    "rounded-b-lg",
                                            )}
                                        >
                                            <div className="flex justify-center items-center">
                                                <span
                                                    className={twMerge(
                                                        "flex justify-center relative",
                                                        G.currentPositions[
                                                            sum
                                                        ] !== undefined &&
                                                            isTarget &&
                                                            "",
                                                    )}
                                                >
                                                    {dataNode}
                                                    {isTarget &&
                                                        isTargetSelected && (
                                                            <span
                                                                className={twMerge(
                                                                    "absolute flex items-center justify-center text-xs left-3 top-3 rounded-full p-1",
                                                                    isTargetSelected &&
                                                                        "bg-primary text-primary-content border-2 border-base-100",
                                                                )}
                                                            >
                                                                <Icon
                                                                    path={
                                                                        mdiPlus
                                                                    }
                                                                    size={0.4}
                                                                />
                                                                {targetScore}
                                                            </span>
                                                        )}
                                                    {!isTarget &&
                                                        isCurrentPlayer &&
                                                        amountOverTarget >
                                                            0 && (
                                                            <span
                                                                className={twMerge(
                                                                    "absolute flex items-center justify-center text-xs left-4 top-3 rounded-full p-1 bg-accent text-accent-content h-4 w-4",
                                                                )}
                                                            >
                                                                {
                                                                    amountOverTarget
                                                                }
                                                            </span>
                                                        )}
                                                </span>
                                            </div>
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
