import { Client } from "boardgame.io/react";
import { DiceyDartsGame } from "./Game";
import { Debug } from "boardgame.io/debug";
import { Server } from "boardgame.io";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard";
import { LocalFirestore } from "./multiplayer/LocalFirestore";
import { firebaseConfig } from "./firestore/firestoreDb";
import logger from "redux-logger";
import { applyMiddleware } from "redux";
import { useEffect, useState } from "react";
import { ClientFirestoreStorage } from "./firestore/ClientFirestoreStorage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";

const storage = new ClientFirestoreStorage({});

/**
 * Given players, returns the count of players.
 */
const getNumPlayers = (players: Server.MatchData["players"]): number =>
    Object.keys(players).length;

/**
 * Given players, tries to find the ID of the first player that can be joined.
 * Returns `undefined` if there’s no available ID.
 */
const getFirstAvailablePlayerID = (
    players: Server.MatchData["players"],
): string | undefined => {
    const numPlayers = getNumPlayers(players);
    // Try to get the first index available
    for (let i = 0; i < numPlayers; i++) {
        if (
            typeof players[i].name === "undefined" ||
            players[i].name === null
        ) {
            return String(i);
        }
    }
};

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

export const GameClient = ({ matchId }: { matchId: string }) => {
    const [value, loading, error] = useDocument(doc(storage.metadata, matchId));
    const [playerId, setPlayerId] = useState<string | undefined>(
        localStorage.getItem(`playerID for matchID=${matchId}`) || undefined,
    );

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    useEffect(() => {
        const matchData = value?.data();
        if (matchData?.players && !playerId) {
            const firstAvailablePlayerID = getFirstAvailablePlayerID(
                matchData.players,
            );
            if (firstAvailablePlayerID) {
                const playerIdNum = parseInt(firstAvailablePlayerID);
                setPlayerId(firstAvailablePlayerID);
                localStorage.setItem(
                    `playerID for matchID=${matchId}`,
                    firstAvailablePlayerID,
                );
                void storage.setMetadata(matchId, {
                    [`players.${playerIdNum}`]: {
                        name: "Player " + (playerIdNum + 1),
                        id: playerIdNum,
                        data: {
                            joined: true,
                        },
                    },
                });
            }
        }
    }, [value, playerId, matchId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <ClientGame playerID={playerId} matchID={matchId} />;
};
