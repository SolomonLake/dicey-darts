import { Master } from "boardgame.io/master";
import { CreateGameReducer, Transport } from "boardgame.io/internal";
import { getFilterPlayerView } from "boardgame.io/internal";
import { ClientFirestoreStorage } from "../firestore/ClientFirestoreStorage";
import { FirebaseOptions } from "firebase/app";
import { Dispatch, applyMiddleware, createStore } from "redux";
import {
    ActionShape,
    Store,
    Server,
    TransientMetadata,
    TransientState,
} from "boardgame.io";

declare type TransportAPI = Master["transportAPI"];
declare type TransportData = Parameters<Transport["notifyClient"]>[0];
declare type TransportOpts = ConstructorParameters<typeof Transport>[0];
declare type PlayerID = string;
declare type Game = TransportOpts["gameKey"];
declare type State = Parameters<Transport["sendAction"]>[0];
declare type OnUpdateAction = Parameters<Master["onUpdate"]>[0];

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
 * Remove player credentials from action payload
 */
const stripCredentialsFromAction = (action: OnUpdateAction) => {
    const { credentials, ...payload } = action.payload;
    return { ...action, payload };
};

/**
 * ExtractTransientsFromState
 *
 * Split out transients from the a TransientState
 */
function ExtractTransients(
    transientState: TransientState | null,
): [State | null, TransientMetadata | undefined] {
    if (!transientState) {
        // We preserve null for the state for legacy callers, but the transient
        // field should be undefined if not present to be consistent with the
        // code path below.
        return [null, undefined];
    }
    const { transients, ...state } = transientState;
    return [state as State, transients as TransientMetadata];
}

/**
 * Private action used to strip transient metadata (e.g. errors) from the game
 * state.
 */
export const stripTransients = () => ({
    type: "STRIP_TRANSIENTS",
});

export const TransientHandlingMiddleware =
    (store: Store) =>
    (next: Dispatch<ActionShape.Any>) =>
    (action: ActionShape.Any) => {
        const result = next(action);
        switch (action.type) {
            case "STRIP_TRANSIENTS": {
                return result;
            }
            default: {
                const [, transients] = ExtractTransients(store.getState());
                if (typeof transients !== "undefined") {
                    // @ts-expect-error We know this is a valid action
                    store.dispatch(stripTransients());
                    // Dev Note: If parent middleware needs to correlate the spawned
                    // StripTransients action to the triggering action, instrument here.
                    //
                    // This is a bit tricky; for more details, see:
                    //   https://github.com/boardgameio/boardgame.io/pull/940#discussion_r636200648
                    return {
                        ...result,
                        transients,
                    };
                }
                return result;
            }
        }
    };

/**
 * Creates a local version of the master that the client
 * can interact with.
 */
export class LocalFirestoreMaster extends Master {
    declare storageAPI: ClientFirestoreStorage;

    connect: (
        playerID: PlayerID,
        callback: (data: TransportData) => void,
    ) => void;

    async onUpdateFb(
        credAction: OnUpdateAction,
        state: State,
        matchID: string,
        playerID: string,
    ): Promise<void | { error: string }> {
        if (!credAction || !credAction.payload) {
            return { error: "missing action or action payload" };
        }

        if (this.auth) {
            const { metadata }: { metadata: Server.MatchData | undefined } =
                await this.storageAPI.fetch(matchID, {
                    metadata: true,
                });

            if (metadata) {
                const isAuthentic = await this.auth.authenticateCredentials({
                    playerID,
                    credentials: credAction.payload.credentials,
                    metadata,
                });
                if (!isAuthentic) {
                    return { error: "unauthorized action" };
                }
            }
        }

        const action = stripCredentialsFromAction(credAction);
        const key = matchID;

        // let state: State;
        // if (StorageAPI.isSynchronous(this.storageAPI)) {
        //     ({ state } = this.storageAPI.fetch(key, { state: true }));
        // } else {
        //     ({ state } = await this.storageAPI.fetch(key, { state: true }));
        // }

        if (state === undefined) {
            console.error(`game not found, matchID=[${key}]`);
            return { error: "game not found" };
        }

        if (state.ctx.gameover !== undefined) {
            console.error(
                `game over - matchID=[${key}] - playerID=[${playerID}]` +
                    ` - action[${action.payload.type}]`,
            );
            return;
        }

        const reducer = CreateGameReducer({
            game: this.game,
        });
        // @ts-expect-error We know this is a valid action
        const middleware = applyMiddleware(TransientHandlingMiddleware);
        // @ts-expect-error Store types...
        const store = createStore(reducer, state, middleware);

        // Only allow UNDO / REDO if there is exactly one player
        // that can make moves right now and the person doing the
        // action is that player.
        if (action.type == "UNDO" || action.type == "REDO") {
            const hasActivePlayers = state.ctx.activePlayers !== null;
            const isCurrentPlayer = state.ctx.currentPlayer === playerID;

            if (
                // If activePlayers is empty, non-current players can’t undo.
                (!hasActivePlayers && !isCurrentPlayer) ||
                // If player is not active or multiple players are active, can’t undo.
                (hasActivePlayers &&
                    (state.ctx.activePlayers?.[playerID] === undefined ||
                        Object.keys(state.ctx.activePlayers).length > 1))
            ) {
                console.error(
                    `playerID=[${playerID}] cannot undo / redo right now`,
                );
                return;
            }
        }

        // Check whether the player is active.
        if (!this.game.flow.isPlayerActive(state.G, state.ctx, playerID)) {
            console.error(
                `player not active - playerID=[${playerID}]` +
                    ` - action[${action.payload.type}]`,
            );
            return;
        }

        // Get move for further checks
        const move =
            action.type == "MAKE_MOVE"
                ? this.game.flow.getMove(
                      state.ctx,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      action.payload.type,
                      playerID,
                  )
                : null;

        // Check whether the player is allowed to make the move.
        if (action.type == "MAKE_MOVE" && !move) {
            console.error(
                `move not processed - canPlayerMakeMove=false - playerID=[${playerID}]` +
                    ` - action[${action.payload.type}]`,
            );
            return;
        }

        // Check if action's stateID is different than store's stateID
        // and if move does not have ignoreStaleStateID truthy.
        // if (
        //     state._stateID !== state.stateID &&
        //     !(move && IsLongFormMove(move) && move.ignoreStaleStateID)
        // ) {
        //     logging.error(
        //         `invalid stateID, was=[${stateID}], expected=[${state._stateID}]` +
        //             ` - playerID=[${playerID}] - action[${action.payload.type}]`,
        //     );
        //     return;
        // }

        const prevState = store.getState();

        // Update server's version of the store.
        store.dispatch(action);
        state = store.getState();

        this.subscribeCallback({
            state,
            action,
            matchID,
        });

        if (this.game.deltaState) {
            this.transportAPI.sendAll({
                type: "patch",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                args: [matchID, state._stateID, prevState, state],
            });
        } else {
            this.transportAPI.sendAll({
                type: "update",
                args: [matchID, state],
            });
        }

        const { deltalog, ...stateWithoutDeltalog } = state;

        const { metadata }: { metadata: Server.MatchData | undefined } =
            await this.storageAPI.fetch(matchID, {
                metadata: true,
            });

        let newMetadata: Server.MatchData | undefined;
        if (
            metadata &&
            (metadata.gameover === undefined || metadata.gameover === null)
        ) {
            newMetadata = {
                ...metadata,
                updatedAt: Date.now(),
            };
            if (state.ctx.gameover !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                newMetadata.gameover = state.ctx.gameover;
            }
        }

        const writes = [
            this.storageAPI.setState(key, stateWithoutDeltalog, deltalog),
        ];
        if (newMetadata) {
            writes.push(this.storageAPI.setMetadata(key, newMetadata));
        }
        await Promise.all(writes);
    }

    constructor({ game, bots, storageKey, config }: LocalMasterOpts) {
        const clientCallbacks: Record<PlayerID, (data: TransportData) => void> =
            {};
        const initializedBots: Record<string, any> = {};

        if (game && game.ai && bots) {
            for (const playerID in bots) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const bot = bots[playerID];
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
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
                const doBotAction = async () => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const botAction = await initializedBots[botPlayer].play(
                        state,
                        botPlayer,
                    );
                    await this.onUpdateFb(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        botAction.action,
                        state,
                        matchID,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        botAction.action.payload.playerID,
                    );
                };
                setTimeout(() => {
                    void doBotAction();
                }, 100);
            }
        });
    }
}

type LocalTransportOpts = TransportOpts & {
    master: LocalFirestoreMaster;
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

    sendChatMessage(
        matchID: string,
        chatMessage: Parameters<Transport["sendChatMessage"]>[1],
    ): void {
        const args: Parameters<Master["onChatMessage"]> = [
            matchID,
            chatMessage,
            this.credentials,
        ];
        void this.master.onChatMessage(...args);
    }

    sendAction(state: State, action: OnUpdateAction): void {
        if (this.playerID === null) {
            throw new Error("playerID not provided");
        }
        void this.master.onUpdateFb(action, state, this.matchID, this.playerID);
    }

    requestSync(): void {
        void this.master.onSync(
            this.matchID,
            this.playerID,
            this.credentials,
            this.numPlayers,
        );
    }

    connect(): void {
        this.setConnectionStatus(true);
        if (this.playerID) {
            this.master.connect(this.playerID, (data) =>
                this.notifyClient(data),
            );
        }
        this.requestSync();

        // TODO: watch for changes in fb state db, and push notifyClient
        this.master.storageAPI.watchMatchState(this.matchID, (state) => {
            // @ts-expect-error Delta updates are not needed for client update
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

const getLocalMaster = (
    { gameKey, game }: TransportOpts,
    { bots, storageKey, config }: LocalOpts,
) => {
    const instance = localMasters.get(gameKey);
    if (
        instance &&
        instance.bots === bots &&
        instance.storageKey === storageKey &&
        instance.config === config
    ) {
        return instance.master;
    } else {
        const master = new LocalFirestoreMaster({
            game,
            bots,
            storageKey,
            config,
        });
        localMasters.set(gameKey, { master, bots, storageKey, config });
        return master;
    }
};

/**
 * Create a local transport.
 */
export function LocalFirestore(opts: LocalOpts) {
    return (transportOpts: TransportOpts) => {
        const master: LocalFirestoreMaster = getLocalMaster(
            transportOpts,
            opts,
        );

        return new LocalFirestoreTransport({ master, ...transportOpts });
    };
}
