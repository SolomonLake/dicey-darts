import _ from "lodash";
import { MyGameState } from "../Game";
import { MAX_POSITION } from "../constants";

export const completedSums = (
    G: MyGameState,
    playerId: string,
    isCurrentPlayer: boolean,
): number => {
    return _.values(
        isCurrentPlayer
            ? {
                  ...G.checkpointPositions[playerId],
                  ...G.currentPositions,
              }
            : G.checkpointPositions[playerId],
    ).reduce((total, pos) => (pos === MAX_POSITION ? total + 1 : total), 0);
};
