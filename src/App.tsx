import { useState } from "react";
import compassLogo from "./assets/compass.svg";
import { twMerge } from "tailwind-merge";
import { dice2OddsTuple, getOddsCalculator } from "./probs";
import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./Game";
// import { TicTacToeBoard } from "./TicTacToeBoard";

const LogoImage = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"img">) => (
    <img
        className={twMerge(
            "h-24 m-6 transition will-change-contents filter duration-300 hover:drop-shadow-[0_0_32px_#646cffaa]",
            className,
        )}
        {...props}
    />
);

const ClientGame = Client({
    game: DiceyDarts,
    // board: TicTacToeBoard,
});

export const App = () => {
    const [count, setCount] = useState(0);

    const oddsCalculator = getOddsCalculator(4, 4);
    (window as any).oddsCalulator = oddsCalculator;
    const numAllowed = 2;
    // console.log(oddsCalculator.dice2sums);
    console.log(oddsCalculator.enumerateOdds(numAllowed));
    console.log(
        dice2OddsTuple(oddsCalculator.enumerateOdds(numAllowed)).sort(
            (a, b) => b[1] - a[1],
        ),
    );

    return (
        <div className="flex flex-col place-items-center min-h-screen text-center p-8 justify-center">
            <div className="flex">
                <LogoImage
                    src={compassLogo}
                    alt="React logo"
                    className="hover:drop-shadow-[0_0_32px_#61dafbaa] motion-safe:animate-[spin_15s_linear_infinite]"
                />
            </div>
            <h1>Adventure AI!</h1>
            <div className="p-8">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p>Click on the Vite and React logos to learn more</p>
            <ClientGame />
        </div>
    );
};
