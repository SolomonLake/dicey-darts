import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./DiceyDartsGame";
import { Debug } from "boardgame.io/debug";
import { Local } from "boardgame.io/multiplayer";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard";

export const DiceyDartsClientGame = ({ lobbyId }: { lobbyId: string }) => {
    const ClientGame = Client({
        game: DiceyDarts,
        numPlayers: 2,
        board: DiceyDartsBoard,
        debug: {
            impl: Debug,
            collapseOnLoad: true,
        },
        multiplayer: Local({
            // Enable localStorage cache.
            persist: true,

            // Set custom prefix to store data under. Default: 'bgio'.
            storageKey: "bgio_" + lobbyId,
        }),
    });

    return <ClientGame playerID="0" />;
};
