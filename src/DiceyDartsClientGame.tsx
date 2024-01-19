import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./DiceyDartsGame";
import { Debug } from "boardgame.io/debug";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard";
import { LocalFirestore } from "./multiplayer/LocalFirestore";
import { firebaseConfig } from "./firestore/firestoreDb";
import logger from "redux-logger";
import { applyMiddleware } from "redux";

export const DiceyDartsClientGame = ({ lobbyId }: { lobbyId: string }) => {
    const ClientGame = Client({
        game: DiceyDarts,
        numPlayers: 2,
        board: DiceyDartsBoard,
        debug: {
            impl: Debug,
            collapseOnLoad: true,
        },
       // multiplayer: LocalFirestore({
        //    config: firebaseConfig,
       // }),
        enhancer: applyMiddleware(logger),

        // multiplayer: Local({
        //     // Enable localStorage cache.
        //     persist: true,

        //     // Set custom prefix to store data under. Default: 'bgio'.
        //     storageKey: "bgio_" + lobbyId,
        // }),
    });

    return <ClientGame playerID="0" matchID={lobbyId} />;
};
