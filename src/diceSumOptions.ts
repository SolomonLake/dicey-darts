import _ from "lodash";
import { Positions, oddsCalculator } from "./DiceyDartsGame";
import { MAX_POSITION } from "./constants";

export type SumOption = {
    // The 2 numbers
    diceSums: number[];
    // In a non-split case this contains only one element.
    enabled: boolean[];
    forceSplit: boolean;
};

export const DICE_INDICES = [
    [
        [0, 1],
        [2, 3],
    ],
    [
        [0, 2],
        [1, 3],
    ],
    [
        [0, 3],
        [1, 2],
    ],
];

/*
 * Convenient function to create a SumOption object
 */
export const makeSumOption = (
    diceSums: number[],
    enabled?: boolean[],
    forceSplit?: boolean,
): SumOption => {
    forceSplit = forceSplit == null ? false : true;
    enabled = enabled == null ? [true, true] : enabled;
    return {
        diceSums,
        enabled,
        forceSplit,
    };
};

export type GetBlockedSumsParams = {
    currentPositions: Positions;
    checkpointPositions: { [playerId: string]: Positions };
    numPlayers: number;
    currentPlayer: string;
};

export const getBlockedSums = ({
    currentPositions,
    checkpointPositions,
    numPlayers,
    currentPlayer,
}: GetBlockedSumsParams) => {
    const blockedSums = new Set<number>();
    const almostBlockedSums = new Set<number>();

    const finishedSums = _.reduce(
        checkpointPositions,
        (finishedSums: { [diceSum: string]: number }, positions, playerId) => {
            _.forEach(positions, (position, diceSum) => {
                if (!finishedSums[diceSum]) finishedSums[diceSum] = 0;
                if (position === MAX_POSITION) {
                    finishedSums[diceSum] += 1;
                }
            });

            if (currentPlayer === playerId) {
                _.forEach(currentPositions, (position, diceSum) => {
                    // Player has just finished sum this turn.
                    if (
                        position === MAX_POSITION &&
                        checkpointPositions[playerId]?.[diceSum] !==
                            MAX_POSITION
                    ) {
                        if (!finishedSums[diceSum]) finishedSums[diceSum] = 0;
                        finishedSums[diceSum] += 1;
                    }
                });
            }

            return finishedSums;
        },
        {},
    );
    oddsCalculator.possibleSums.forEach((possibleSum): void => {
        if (finishedSums[possibleSum] === numPlayers) {
            blockedSums.add(possibleSum);
        }
        if (finishedSums[possibleSum] === numPlayers - 1) {
            const aboutToFinishCurrent =
                currentPositions[possibleSum] === MAX_POSITION - 1;
            const hasntStartedAboutToFinish =
                !currentPositions[possibleSum] &&
                checkpointPositions[currentPlayer]?.[possibleSum] ===
                    MAX_POSITION - 1;
            if (aboutToFinishCurrent || hasntStartedAboutToFinish) {
                almostBlockedSums.add(possibleSum);
            }
        }
    });

    return [blockedSums, almostBlockedSums];
};

// We split if we can only select one of the two options.
// Force split is for when we can select both options but not at the same time.
export const isSumOptionSplit = (sumOption: SumOption): boolean => {
    return (
        sumOption?.forceSplit || sumOption.enabled[0] !== sumOption.enabled[1]
    );
};

export type DiceSumOptions = ReturnType<typeof getSumOptions>;

/*
 * Compute the 3 options the current player has given the state of the game and the dice
 * rolled.
 */
export const getSumOptions = (
    diceValues: number[],
    currentPositions: { [key: number]: number },
    checkpointPositions: { [key: string]: { [key: number]: number } },
    playerID: string,
    numPlayers: number,
): SumOption[] => {
    if (diceValues.length !== 4) {
        throw new Error("Should have 4 values");
    }

    const numSelectionsLeft = 2 - Object.keys(currentPositions).length;

    const [blockedSums, almostBlockedSums] = getBlockedSums({
        currentPositions,
        checkpointPositions,
        numPlayers,
        currentPlayer: playerID,
    });

    // Object.entries(currentPositions).forEach(([diceSumStr, currentStep]) => {
    //     const diceSum = parseInt(diceSumStr);
    //     const space = getSpaceLeft(
    //         currentPositions,
    //         checkpointPositions,
    //         mountainShape,
    //         sameSpace,
    //         diceSum,
    //         playerID,
    //     );

    //     currentClimberSpaceLeft.set(diceSum, space);

    //     // If there is no space left for some climbers, then those columns are actually
    //     // blocked.
    //     if (space === 0) {
    //         updatedBlockedSums.add(diceSum);
    //     }
    // });

    // First compute all the dice sums.
    const allDiceSums = DICE_INDICES.map((group): SumOption => {
        // Compute the 2 sums.
        const diceSums: number[] = group.map((twoDiceIndices): number => {
            return twoDiceIndices
                .map((i) => diceValues[i])
                .reduce((a, b) => a + b);
        });

        if (diceSums[0] === diceSums[1]) {
            // Both of the sums are the same.
            const diceSum = diceSums[0];
            // If the column is blocked, there are no options.
            if (blockedSums.has(diceSum)) {
                return makeSumOption(diceSums, [false, false]);
            }

            // Have we already selected that "sum" or we have selections left?
            if (currentPositions[diceSum] != null || numSelectionsLeft > 0) {
                if (almostBlockedSums.has(diceSum)) {
                    // If the column is almost blocked, we can choose the sum only once.
                    return makeSumOption(
                        diceSums,
                        [true, true],
                        /*forceSplit*/ true,
                    );
                } else {
                    return makeSumOption(diceSums);
                }
            } else {
                // We have not selected the sum and we have no selections left.
                return makeSumOption(diceSums, [false, false]);
            }
        } else {
            // Both sums are different.
            let selectedAtLeastOne = false;

            // Are they enabled?
            const enabled = diceSums.map((diceSum: number): boolean => {
                const alreadySelectedIt =
                    currentPositions.hasOwnProperty(diceSum);

                if (alreadySelectedIt) {
                    // While we are at it note that we are climbing at least one of those
                    selectedAtLeastOne = true;
                }

                const isBlocked = blockedSums.has(diceSum);

                // We can use that number if the column is not blocked and if we have some
                // climbers left or if we are already climbing it.
                return (
                    !isBlocked && (numSelectionsLeft > 0 || alreadySelectedIt)
                );
            });

            // Now the only tricky case left is if we are allowed for both sums, *but not
            // at the same time*.
            // This happens when we have only one climber left, and if the two sums are new
            // sums that we are not already climbing.
            const forceSplit =
                numSelectionsLeft === 1 &&
                !selectedAtLeastOne &&
                enabled.every((x) => x);

            return {
                diceSums,
                enabled,
                forceSplit,
            };
        }
    });

    return allDiceSums;
};
