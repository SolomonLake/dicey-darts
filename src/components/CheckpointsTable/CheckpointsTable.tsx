import _ from "lodash";
import { SUM_SCORES } from "../../constants";
import { MyGameState } from "../../Game";
import { twMerge } from "tailwind-merge";
import Icon from '@mdi/react';
import { mdiCircleOutline } from '@mdi/js';

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
                            const innerEl =
                                playerId === "Target" ? (
                                    ""
                                ) : (
                                    <div>
                                        <h2 className="my-0 flex flex-col">
                                            <span
                                                className={twMerge(
                                                    "my-0",
                                                    currentPlayerId ===
                                                        playerId &&
                                                        "text-red-500",
                                                )}
                                            >
                                                Player {playerId}
                                            </span>
                                            <span className="flex justify-around">
                                                <span>
                                                    +
                                                    {G.currentPlayerScores[
                                                        playerId
                                                    ] -
                                                        G.playerScores[
                                                            playerId
                                                        ]}
                                                </span>
                                                <span>
                                                    {
                                                        G.currentPlayerScores[
                                                            playerId
                                                        ]
                                                    }
                                                </span>
                                            </span>
                                        </h2>
                                    </div>
                                );

                            return (
                                <th key={i} scope="col" className="">
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
                                    if (!isTarget) {
                                        if (data === 3) {
                                            data = "*";
                                        } else if (data === 2) {
                                            data = "X";
                                        } else if (data === 1) {
                                            data = (<Icon path={mdiCircleOutline} size={1} />);
                                        } else {
                                            data = "";
                                        }
                                    }   
                                    return (
                                        <td
                                            key={j}
                                            className={twMerge(
                                                "text-lg md:text-2xl",
                                                isTarget ? "text-gray-400" : "",
                                                G.currentPositions[sum] !==
                                                    undefined &&
                                                    isTarget &&
                                                    "text-red-500",
                                            )}
                                        >
                                            {data}
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
