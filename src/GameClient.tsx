import { Client } from "boardgame.io/react";
import { DiceyDartsGame } from "./Game";
import { Debug } from "boardgame.io/debug";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard";
import { LocalFirestore } from "./multiplayer/LocalFirestore";
import { firebaseConfig } from "./firestore/firestoreDb";
import logger from "redux-logger";
import { applyMiddleware } from "redux";

export const GameClient = ({ lobbyId }: { lobbyId: string }) => {
    const ClientGame = Client({
        game: DiceyDartsGame,
        numPlayers: 12,
        board: DiceyDartsBoard,
        debug: false,
        // {
        //     impl: import.meta.env.MODE === "production" ? undefined : Debug,
        //     collapseOnLoad: true,
        // },
        multiplayer: LocalFirestore({
            config: firebaseConfig,
        }),
        enhancer: applyMiddleware(logger),
    });

    return <ClientGame playerID="0" matchID={lobbyId} />;
};
