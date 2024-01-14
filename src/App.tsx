import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./Game";
import { Debug } from "boardgame.io/debug";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard/DiceyDartsBoard";
import { DarkModeSwitcher } from "./components/DarkModeSwitcher/DarkModeSwitcher";

const ClientGame = Client({
    game: DiceyDarts,
    numPlayers: 2,
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
                <h1 className="mb-0 text-3xl">Dicey Darts</h1>
                <DarkModeSwitcher />
            </div>
            <ClientGame />
        </div>
    );
};
