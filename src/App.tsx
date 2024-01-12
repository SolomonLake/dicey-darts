import dartLogo from "./assets/dart.svg";
import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./Game";
import { Debug } from "boardgame.io/debug";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard/DiceyDartsBoard";
import { DarkModeSwitcher } from "./components/DarkModeSwitcher/DarkModeSwitcher";

const ClientGame = Client({
    game: DiceyDarts,
    board: DiceyDartsBoard,
    debug: {
        impl: Debug,
        collapseOnLoad: import.meta.env.MODE === "production" || true,
    },
});

export const App = () => {
    return (
        <div className="flex flex-col w-full place-items-center h-dvh text-center p-5 gap-2 overflow-auto prose prose-stone max-w-none">
            {/* Header */}
            <div className="flex flex-row items-center gap-2">
                <div className="flex">
                    <img
                        src={dartLogo}
                        alt="Dicey Darts Logo"
                        className="h-8 my-0"
                    />
                </div>
                <h1 className="mb-0 text-3xl">Dicey Darts</h1>
                <DarkModeSwitcher />
            </div>
            <ClientGame />
        </div>
    );
};
