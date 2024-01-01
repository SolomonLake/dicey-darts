import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

export interface MyGameState {
    cells: string[];
}

const setup = () => {
    return {
        cells: Array(9).fill(""),
    };
};

const clickCell: Move<MyGameState> = ({ G, playerID }, id: number) => {
    if (G.cells[id] !== "") {
        return INVALID_MOVE;
    }
    G.cells[id] = playerID;
};

// Return true if `cells` is in a winning configuration.
function IsVictory(cells: string[]) {
    const positions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const isRowComplete = (row: number[]) => {
        const symbols = row.map((i) => cells[i]);
        return symbols.every((i) => i !== "" && i === symbols[0]);
    };

    return positions.map(isRowComplete).some((i) => i === true);
}

// Return true if all `cells` are occupied.
function IsDraw(cells: string[]) {
    return cells.filter((c) => c === "").length === 0;
}

export const DiceyDarts: Game<MyGameState> = {
    name: "dicey-darts",
    setup,

    turn: {
        minMoves: 1,
        maxMoves: 1,
    },

    moves: {
        clickCell,
    },

    endIf: ({ G, ctx }) => {
        if (IsVictory(G.cells)) {
            return { winner: ctx.currentPlayer };
        }
        if (IsDraw(G.cells)) {
            return { draw: true };
        }
    },

    ai: {
        enumerate: (G) => {
            const moves = [];
            for (let i = 0; i < 9; i++) {
                if (G.cells[i] === "") {
                    moves.push({ move: "clickCell", args: [i] });
                }
            }
            return moves;
        },
    },
};
