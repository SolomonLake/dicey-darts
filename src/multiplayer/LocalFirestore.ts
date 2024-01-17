/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Master } from "boardgame.io/src/master/master";
import type {
    TransportAPI,
    TransportData,
} from "boardgame.io/dist/types/src/master/master";
import { Transport } from "boardgame.io/src/client/transport/transport";
import type { TransportOpts } from "boardgame.io/dist/types/src/client/transport/transport";
import type {
    ChatMessage,
    CredentialedActionShape,
    Game,
    PlayerID,
    State,
} from "boardgame.io/dist/types/src/types";
import { getFilterPlayerView } from "boardgame.io/src/master/filter-player-view";
import { ClientFirestoreStorage } from "../firestore/ClientFirestoreStorage";
import { FirebaseOptions } from "firebase/app";
import { onSnapshot } from "@firebase/firestore";

/**
 * Returns null if it is not a bot's turn.
 * Otherwise, returns a playerID of a bot that may play now.
 */
export function GetBotPlayer(state: State, bots: Record<PlayerID, any>) {
    if (state.ctx.gameover !== undefined) {
        return null;
    }

    if (state.ctx.activePlayers) {
        for (const key of Object.keys(bots)) {
            if (key in state.ctx.activePlayers) {
                return key;
            }
        }
    } else if (state.ctx.currentPlayer in bots) {
        return state.ctx.currentPlayer;
    }

    return null;
}

interface LocalOpts {
    bots?: Record<PlayerID, any>;
    storageKey?: string;
    config: FirebaseOptions;
}

type LocalMasterOpts = LocalOpts & {
    game: Game;
};

/**
 * Creates a local version of the master that the client
 * can interact with.
 */
export class LocalFirestoreMaster extends Master {
    connect: (
        playerID: PlayerID,
        callback: (data: TransportData) => void,
    ) => void;

    async onUpdate(
        credAction: CredentialedActionShape.Any,
        stateID: number,
        matchID: string,
        playerID: string,
    ): Promise<void | { error: string }> {
        // this.transportAPI.sendAll({
        //     type: "update",
        //     args: [matchID, state],
        // });
        return super.onUpdate(credAction, stateID, matchID, playerID);
    }

    constructor({ game, bots, storageKey, config }: LocalMasterOpts) {
        const clientCallbacks: Record<PlayerID, (data: TransportData) => void> =
            {};
        const initializedBots = {};

        if (game && game.ai && bots) {
            for (const playerID in bots) {
                const bot = bots[playerID];
                initializedBots[playerID] = new bot({
                    game,
                    enumerate: game.ai.enumerate,
                    seed: game.seed,
                });
            }
        }

        const send: TransportAPI["send"] = ({ playerID, ...data }) => {
            const callback = clientCallbacks[playerID];
            if (callback !== undefined) {
                callback(filterPlayerView(playerID, data));
            }
        };

        const filterPlayerView = getFilterPlayerView(game);
        const transportAPI: TransportAPI = {
            send,
            sendAll: (payload) => {
                for (const playerID in clientCallbacks) {
                    send({ playerID, ...payload });
                }
            },
        };
        const storage = new ClientFirestoreStorage({
            dbPrefix: storageKey,
            config,
        });
        super(game, storage, transportAPI);

        this.connect = (playerID, callback) => {
            clientCallbacks[playerID] = callback;
        };

        this.subscribe(({ state, matchID }) => {
            if (!bots) {
                return;
            }
            const botPlayer = GetBotPlayer(state, initializedBots);
            if (botPlayer !== null) {
                setTimeout(async () => {
                    const botAction = await initializedBots[botPlayer].play(
                        state,
                        botPlayer,
                    );
                    console.log("HERE bots");
                    await this.onUpdate(
                        botAction.action,
                        state._stateID,
                        matchID,
                        botAction.action.payload.playerID,
                    );
                }, 100);
            }
        });
    }
}

type LocalTransportOpts = TransportOpts & {
    master?: LocalFirestoreMaster;
};

/**
 * Local
 *
 * Transport interface that embeds a GameMaster within it
 * that you can connect multiple clients to.
 */
export class LocalFirestoreTransport extends Transport {
    master: LocalFirestoreMaster;

    /**
     * Creates a new Mutiplayer instance.
     * @param {string} matchID - The game ID to connect to.
     * @param {string} playerID - The player ID associated with this client.
     * @param {string} gameName - The game type (the `name` field in `Game`).
     * @param {string} numPlayers - The number of players.
     */
    constructor({ master, ...opts }: LocalTransportOpts) {
        super(opts);
        this.master = master;
    }

    sendChatMessage(matchID: string, chatMessage: ChatMessage): void {
        const args: Parameters<Master["onChatMessage"]> = [
            matchID,
            chatMessage,
            this.credentials,
        ];
        this.master.onChatMessage(...args);
    }

    sendAction(state: State, action: CredentialedActionShape.Any): void {
        console.log("sendAction", state, action);
        this.master.onUpdate(
            action,
            state._stateID,
            this.matchID,
            this.playerID,
        );
    }

    requestSync(): void {
        this.master.onSync(
            this.matchID,
            this.playerID,
            this.credentials,
            this.numPlayers,
        );
    }

    connect(): void {
        this.setConnectionStatus(true);
        this.master.connect(this.playerID, (data) => this.notifyClient(data));
        this.requestSync();

        // TODO: watch for changes in fb state db, and push notifyClient
        this.master.storageAPI.watchMatch(this.matchID, (state) => {
            this.notifyClient({
                type: "update",
                args: [this.matchID, state],
            });
        });
    }

    disconnect(): void {
        this.setConnectionStatus(false);
    }

    updateMatchID(id: string): void {
        this.matchID = id;
        this.connect();
    }

    updatePlayerID(id: PlayerID): void {
        this.playerID = id;
        this.connect();
    }

    updateCredentials(credentials?: string): void {
        this.credentials = credentials;
        this.connect();
    }
}

/**
 * Global map storing local master instances.
 */
const localMasters: Map<Game, { master: LocalFirestoreMaster } & LocalOpts> =
    new Map();

/**
 * Create a local transport.
 */
export function LocalFirestore({ bots, storageKey, config }: LocalOpts) {
    return (transportOpts: TransportOpts) => {
        const { gameKey, game } = transportOpts;
        let master: LocalFirestoreMaster;

        const instance = localMasters.get(gameKey);
        if (
            instance &&
            instance.bots === bots &&
            instance.storageKey === storageKey &&
            instance.config === config
        ) {
            master = instance.master;
        }

        if (!master) {
            master = new LocalFirestoreMaster({
                game,
                bots,
                storageKey,
                config,
            });
            localMasters.set(gameKey, { master, bots, storageKey, config });
        }

        return new LocalFirestoreTransport({ master, ...transportOpts });
    };
}
