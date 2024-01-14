import { expect, test } from "vitest";
import { GetBlockedSumsParams, getBlockedSums } from "./diceSumOptions";
import { MAX_POSITION } from "./constants";

const enumerations: [
    GetBlockedSumsParams,
    ReturnType<typeof getBlockedSums>,
][] = [
    [
        {
            currentPositions: {
                "2": 2,
            },
            checkpointPositions: {
                "0": {
                    "2": 1,
                    "3": 1,
                    "4": 1,
                    "5": 1,
                    "6": 1,
                    "7": 1,
                    "8": 1,
                },
                "1": {
                    "2": 2,
                    "3": 1,
                    "4": 1,
                    "5": 1,
                    "6": 1,
                    "7": 1,
                    "8": 1,
                },
            },
            numPlayers: 2,
            currentPlayer: "0",
        },
        [new Set([]), new Set([])],
    ],
    [
        {
            currentPositions: {
                "2": MAX_POSITION,
            },
            checkpointPositions: {
                "0": {
                    "2": 1,
                    "3": 1,
                    "4": 1,
                    "5": 2,
                    "6": 1,
                    "7": 1,
                    "8": 1,
                },
                "1": {
                    "2": MAX_POSITION,
                    "3": 1,
                    "4": 1,
                    "5": MAX_POSITION,
                    "6": 1,
                    "7": 1,
                    "8": 1,
                },
            },
            numPlayers: 2,
            currentPlayer: "0",
        },
        [new Set([2]), new Set([5])],
    ],
    [
        {
            currentPositions: {
                "2": MAX_POSITION,
                "3": MAX_POSITION - 1,
            },
            checkpointPositions: {
                "0": {
                    "2": MAX_POSITION,
                    "3": MAX_POSITION,
                    "4": MAX_POSITION,
                    "5": MAX_POSITION,
                    "6": 1,
                    "7": 1,
                    "8": MAX_POSITION,
                },
                "1": {
                    "2": 0,
                    "3": 1,
                    "4": 1,
                    "5": 1,
                    "6": 1,
                    "7": MAX_POSITION,
                    "8": MAX_POSITION,
                },
            },
            numPlayers: 2,
            currentPlayer: "1",
        },
        [new Set([2, 8]), new Set([3])],
    ],
    [
        {
            currentPositions: {
                "2": MAX_POSITION,
                "3": MAX_POSITION - 1,
            },
            checkpointPositions: {
                "0": {
                    "2": MAX_POSITION,
                    "3": MAX_POSITION,
                    "4": MAX_POSITION,
                    "5": MAX_POSITION,
                    "6": MAX_POSITION,
                    "8": MAX_POSITION,
                },
                "1": {
                    "3": MAX_POSITION - 1,
                    "4": MAX_POSITION,
                    "5": 1,
                    "6": 2,
                    "7": MAX_POSITION,
                    "8": MAX_POSITION,
                },
            },
            numPlayers: 2,
            currentPlayer: "1",
        },
        [new Set([2, 4, 8]), new Set([3, 6])],
    ],
    [
        {
            currentPositions: {
                "5": MAX_POSITION,
                "6": MAX_POSITION,
            },
            checkpointPositions: {
                "0": {
                    "2": 1,
                    "3": MAX_POSITION,
                    "4": MAX_POSITION,
                    "6": 2,
                },
                "1": {
                    "3": MAX_POSITION,
                    "4": MAX_POSITION,
                    "5": MAX_POSITION,
                    "6": 1,
                },
            },
            numPlayers: 2,
            currentPlayer: "0",
        },
        [new Set([3, 4, 5]), new Set([])],
    ],
];
enumerations.forEach(([arg, expected], i) => {
    test(`getBlockedSums ${i}`, () => {
        expect(getBlockedSums(arg)).toStrictEqual(expected);
    });
});
