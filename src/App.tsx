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
        <div className="flex flex-col place-items-center min-h-screen text-center p-6 gap-4 prose prose-stone">
            {/* Header */}
            <div className="flex flex-row items-center gap-4">
                <div className="flex">
                    <img
                        src={dartLogo}
                        alt="Dicey Darts Logo"
                        className="h-8 my-0"
                    />
                </div>
                <h1 className="mb-0">Dicey Darts</h1>
                <DarkModeSwitcher />
            </div>
            <ClientGame />
        </div>
    );
};
