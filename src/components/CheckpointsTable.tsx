import _ from "lodash";
import { NUM_DICE_CHOICE, SUM_FONT_SIZES, SUM_SCORES } from "../constants";
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
    mdiCircleOutline,
    mdiCircle,
    mdiArrowProjectile,
    mdiTriangleOutline,
    mdiTriangle,
    mdiCrown,
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
import { WinnerCrown } from "./WinnerCrown";

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
    const numCurrentPositions: number = _.size(G.currentPositions);

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
    const winners = currentWinners(G, currentPlayerId);
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
                            const isWinning: boolean =
                                winners.includes(playerId);
                            const isTarget = playerId === "Target";
                            const currentPlayerScore =
                                calculateCurrentPlayerScores(
                                    G.currentOverflowPositions,
                                    G.checkpointPositions,
                                    G.playerScores,
                                    currentPlayerId,
                                )[playerId];
                            const hideCrown =
                                winners.length === _.size(G.playerInfos) &&
                                currentPlayerScore === 0;
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
                                        <div className={twMerge("relative")}>
                                            {/* <div
                                                className={twMerge(
                                                    "absolute -bottom-3 w-full h-5 rounded-lg",
                                                )}
                                            /> */}
                                            {/* {isWinning && (
                                                <Icon
                                                    path={mdiCrownOutline}
                                                    className="text-accent p-[2px] bg-base-100 rounded-full absolute -top-3 -left-2"
                                                    size={0.9}
                                                />
                                            )} */}
                                            <h2
                                                className={twMerge(
                                                    "my-0 flex flex-col rounded-lg px-2 h-full",
                                                    playerBgColor,
                                                    playerTextColor,
                                                    // isCurrentPlayer &&
                                                    //     "border-l-8 border-r-8 border-primary",
                                                    // isCurrentPlayer &&
                                                    //     "rounded-b-none",
                                                )}
                                            >
                                                <span
                                                    className={twMerge(
                                                        "flex justify-center gap-1 items-center pt-px",
                                                    )}
                                                >
                                                    {/* {addedScore > 0 && (
                                                        <span className="text-sm">
                                                            +{addedScore}
                                                        </span>
                                                    )} */}
                                                    {isWinning &&
                                                        !hideCrown && (
                                                            <WinnerCrown className="motion-safe:animate-[ping_2s_ease-in-out_2]" />
                                                        )}
                                                    <span className="font-bold">
                                                        {currentPlayerScore}
                                                    </span>
                                                </span>
                                                <span
                                                    className={twMerge(
                                                        "my-0 truncate text-center font-medium",
                                                    )}
                                                >
                                                    {playerName}
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
                                                        "opacity-80",
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
                                    const scoreOverTarget =
                                        amountOverTarget * targetScore;
                                    const showScoreOverTarget =
                                        !isCurrentPlayer &&
                                        !isTarget &&
                                        typeof data === "number" &&
                                        data < 3 &&
                                        scoreOverTarget > 0;
                                    const sumFontSize = isTarget
                                        ? SUM_FONT_SIZES[parseInt(sum)]
                                        : "";
                                    const curPosArray = new Array(
                                        NUM_DICE_CHOICE,
                                    ).fill("");

                                    return (
                                        <td
                                            key={j}
                                            className={twMerge(
                                                G.currentPositions[sum] !==
                                                    undefined &&
                                                    isTarget &&
                                                    "text-primary-content bg-primary rounded-sm",
                                                isSumBlocked && "opacity-40",
                                                isCurrentPlayer &&
                                                    "bg-base-300",
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
                                                        "flex justify-center relative min-w-6 min-h-6 font-normal items-center",
                                                        G.currentPositions[
                                                            sum
                                                        ] !== undefined &&
                                                            isTarget &&
                                                            "",
                                                        sumFontSize,
                                                    )}
                                                >
                                                    {dataNode}
                                                    {showScoreOverTarget && (
                                                        <div className="text-lg text-accent absolute px-3 py-1 bg-base-100 opacity-90">
                                                            +{scoreOverTarget}
                                                        </div>
                                                    )}
                                                    {isTarget &&
                                                        isTargetSelected && (
                                                            <span
                                                                className={twMerge(
                                                                    "absolute flex items-center justify-center text-xs left-4 top-3 rounded-full p-1",
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
                                                    {isCurrentPlayer &&
                                                        isLastRow && (
                                                            <div className="absolute top-9 md:top-11 flex gap-[2px]">
                                                                {curPosArray
                                                                    .map(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => (
                                                                            <Icon
                                                                                key={
                                                                                    i
                                                                                }
                                                                                path={
                                                                                    numCurrentPositions >
                                                                                    i
                                                                                        ? mdiTriangleOutline
                                                                                        : mdiTriangle
                                                                                }
                                                                                size={
                                                                                    0.5
                                                                                }
                                                                                className={twMerge(
                                                                                    playerTextColor,
                                                                                )}
                                                                            />
                                                                        ),
                                                                    )
                                                                    .reverse()}
                                                            </div>
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
