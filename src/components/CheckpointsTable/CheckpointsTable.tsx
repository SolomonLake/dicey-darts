import _ from "lodash";
import { SUM_SCORES } from "../../constants";
import { MyGameState } from "../../Game";
import { twMerge } from "tailwind-merge";

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
        <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <table className="min-w-full text-center text-md font-light">
                            <thead className="font-medium">
                                <tr>
                                    {tablePlayerIdHeaders.map((playerId, i) => {
                                        const innerEl =
                                            playerId === "Target" ? (
                                                ""
                                            ) : (
                                                <div
                                                    className={twMerge(
                                                        "flex flex-col",
                                                    )}
                                                >
                                                    <span
                                                        className={twMerge(
                                                            currentPlayerId ===
                                                                playerId &&
                                                                "text-red-500",
                                                        )}
                                                    >
                                                        Player {playerId}
                                                    </span>
                                                    <span>
                                                        {" ("}
                                                        {
                                                            G.playerScores[
                                                                playerId
                                                            ]
                                                        }
                                                        {" + "}
                                                        {G.currentPlayerScores[
                                                            playerId
                                                        ] -
                                                            G.playerScores[
                                                                playerId
                                                            ]}
                                                        {") = "}
                                                        {
                                                            G
                                                                .currentPlayerScores[
                                                                playerId
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                            );

                                        return (
                                            <th
                                                key={i}
                                                scope="col"
                                                className="px-6 py-4"
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
                                                    tablePlayerIdHeaders[j] ===
                                                    "Target";
                                                return (
                                                    <td
                                                        key={j}
                                                        className={twMerge(
                                                            "px-6 py-4",
                                                            G.currentPositions[
                                                                sum
                                                            ] !== undefined &&
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
                </div>
            </div>
        </div>
    );
};
