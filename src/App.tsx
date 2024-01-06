import compassLogo from "./assets/compass.svg";
import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./Game";
import { Debug } from "boardgame.io/debug";

const ClientGame = Client({
    game: DiceyDarts,
    debug: {
        impl: Debug,
        collapseOnLoad: import.meta.env.MODE === "production",
    },
});

export const App = () => {
    return (
        <div className="flex flex-col place-items-center min-h-screen text-center p-8 justify-between">
            {/* Header */}
            <div className="flex flex-row">
                <div className="flex">
                    <img src={compassLogo} alt="React logo" className="h-8" />
                </div>
                <h1>Dicey Darts</h1>
            </div>
            <div className="p-8">
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p>Click on the Vite and React logos to learn more</p>
            <ClientGame />
        </div>
    );
};
