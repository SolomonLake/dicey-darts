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
        <div className="overflow-x-auto">
            <table className="table my-0 text-lg font-semibold text-center">
                <thead className="">
                    <tr>
                        {tablePlayerIdHeaders.map((playerId, i) => {
                            const innerEl =
                                playerId === "Target" ? (
                                    ""
                                ) : (
                                    <div className={twMerge("")}>
                                        <h2
                                            className={twMerge(
                                                "my-0",
                                                currentPlayerId === playerId &&
                                                    "text-red-500",
                                            )}
                                        >
                                            Player {playerId}
                                        </h2>
                                        <h2>
                                            {" ("}
                                            {G.playerScores[playerId]}
                                            {" + "}
                                            {G.currentPlayerScores[playerId] -
                                                G.playerScores[playerId]}
                                            {") = "}
                                            {G.currentPlayerScores[playerId]}
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
                                    return (
                                        <td
                                            key={j}
                                            className={twMerge(
                                                "",
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
