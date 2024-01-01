type Dice2Sums = { [key: string]: Set<number> };
type Dice2Odds = { [key: string]: number };

// https://stackoverflow.com/a/12628791/1067132
const _f = (a: number[][], b: number[]) =>
    a.flatMap((d) => b.map((e) => [...d, e]));
export const cartesian = (c: number[][]): number[][] => c.reduce(_f, [[]]);

export const diceValues2Sums = (diceValues: number[]): Set<number> => {
    const sums: Set<number> = new Set();
    for (let i = 0; i < diceValues.length - 1; i++) {
        // This is where you'll capture that last value
        for (let j = i + 1; j < diceValues.length; j++) {
            sums.add(diceValues[i] + diceValues[j]);
        }
    }
    return sums;
};

export const diceValues2 = (diceValues: number[]): number[] => {
    const sums = [];
    for (let i = 0; i < diceValues.length - 1; i++) {
        // This is where you'll capture that last value
        for (let j = i + 1; j < diceValues.length; j++) {
            sums.push(diceValues[i] + diceValues[j]);
        }
    }
    return sums;
};

export class OddsCalculator {
    numDice: number;
    numSides: number;
    dice2Sums: Dice2Sums;
    possibleSums: Set<number>;

    constructor(numDice: number = 4, numSides: number = 6) {
        this.numDice = numDice;
        this.numSides = numSides;
        this.dice2Sums = this.buildDice2Sums();
        this.possibleSums = this.buildPossibleSums();
    }

    private buildPossibleSums(): Set<number> {
        const possibleSums: Set<number> = new Set();
        Object.values(this.dice2Sums).forEach((sums) => {
            sums.forEach((sum) => possibleSums.add(sum));
        });
        return possibleSums;
    }

    private buildDice2Sums(): Dice2Sums {
        const diceSides: number[] = Array(this.numSides)
            .fill(null)
            .map((_, i) => i + 1);

        // All the possibilities of N dice.
        const allDiceValues = cartesian(
            Array(this.numDice)
                .fill(null)
                .map(() => diceSides),
        );

        const dice2Sums: Dice2Sums = {};

        // For each possibility, we'll find the set of sums of 2 dice that can be made with those dice.
        allDiceValues.forEach((diceValues) => {
            dice2Sums[diceValues.toString()] = diceValues2Sums(diceValues);
        });

        return dice2Sums;
    }

    odds(allowedSums: number[], hit: boolean = true): number {
        const allowedSumsSet = new Set(allowedSums);

        let numSuccess = 0;
        Object.values(this.dice2Sums).forEach((sums) => {
            for (const sum of sums) {
                if (allowedSumsSet.has(sum)) {
                    numSuccess += 1;
                    break;
                }
            }
        });
        if (hit) {
            return numSuccess / Math.pow(this.numSides, this.numDice);
        }
        return 1 - numSuccess / Math.pow(this.numSides, this.numDice);
    }

    enumerateOdds(numAllowedSums: number, hit: boolean = true): Dice2Odds {
        // All the possibilities of N dice.
        const allPossibleSums = cartesian(
            Array(numAllowedSums)
                .fill(null)
                .map(() => Array.from(this.possibleSums)),
        );
        // No repeating numbers
        const allPossibleSumsWithUniqueSums = allPossibleSums.filter(
            (sums) => new Set(sums).size === sums.length,
        );

        const dice2Sums: Dice2Odds = {};
        allPossibleSumsWithUniqueSums.forEach((diceValues) => {
            const sortedDiceValues = diceValues
                .sort((a, b) => a - b)
                .toString();
            if (dice2Sums[sortedDiceValues] != null) {
                return;
            }
            dice2Sums[sortedDiceValues] = this.odds(diceValues, hit);
        });
        return dice2Sums;
    }

    roll(numDice = this.numDice, numSides = this.numSides): any {
        const dice = Array(numDice)
            .fill(null)
            .map(() => Math.floor(Math.random() * numSides) + 1);
        const sums = diceValues2Sums(dice);
        return [dice, sums, diceValues2(dice).sort((a, b) => a - b)];
    }
}

type DiceAndOdds = [string, number];

export const dice2OddsTuple = (dice2Odds: Dice2Odds): DiceAndOdds[] =>
    Object.entries(dice2Odds).map(([key, value]) => [key, Number(value)]);

const oddsCalculators: { [key: string]: OddsCalculator } = {};
export const getOddsCalculator = (numDice: number, numSides: number) => {
    if (oddsCalculators[`${numDice}-${numSides}`] != null) {
        return oddsCalculators[`${numDice}-${numSides}`];
    }
    oddsCalculators[`${numDice}-${numSides}`] = new OddsCalculator(
        numDice,
        numSides,
    );
    return oddsCalculators[`${numDice}-${numSides}`];
};

// export function getAllowedColumns(
//   currentPositions,
//   blockedSums,
//   mountainShape: MountainShape
// ) {
//   // We start with the blocked columns.
//   const blockedSumsSet = new Set(
//     Object.keys(blockedSums).map((x) => parseInt(x))
//   );
//   // To which we add the columns for which the current position is at the last step,
//   // which makes them blocked too.
//   Object.entries(currentPositions).forEach(([sum, step]) => {
//     if (step === getNumStepsForSum(parseInt(sum), mountainShape)) {
//       blockedSumsSet.add(parseInt(sum));
//     }
//   });

//   let all: number[];
//   if (Object.keys(currentPositions).length < 3) {
//     // If not all the runners are there, allowed columns are everything but the blocked
//     // columns.

//     all = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
//   } else {
//     // If all the runners are available, then, we only have access to those
//     all = Object.keys(currentPositions).map((x) => parseInt(x));
//   }

//   // Then remove the blocked ones.
//   const allowed = all.filter((s) => !blockedSumsSet.has(s));
//   return allowed;
// }
