import { Async } from "boardgame.io/internal";
import { LogEntry, Server, State, StorageAPI } from "boardgame.io";
import {
    extendMatchData,
    standardiseMatchData,
    ExtendedMatchData,
} from "./utils";
import { FirebaseOptions, initializeApp } from "firebase/app";
import {
    CollectionReference,
    Firestore,
    Query,
    arrayUnion,
    collection,
    doc,
    getDocs,
    initializeFirestore,
    onSnapshot,
    query,
    runTransaction,
    setDoc,
    where,
    writeBatch,
} from "firebase/firestore";

export const DB_PREFIX = "bgio_";

export enum DBTable {
    "Metadata" = "metadata",
    "State" = "state",
    "InitialState" = "initialState",
    "Log" = "log",
}

export const tables = [
    DBTable.Metadata,
    DBTable.State,
    DBTable.InitialState,
    DBTable.Log,
] as const;

/**
 * Firestore database class.
 */
export class ClientFirestoreStorage extends Async {
    // readonly client: ReturnType<typeof initializeApp>;
    readonly db: Firestore;
    readonly useCompositeIndexes: boolean;
    readonly metadata: CollectionReference;
    readonly state: CollectionReference;
    readonly initialState: CollectionReference;
    readonly log: CollectionReference;

    /**
     * @param appName - The name of the Firebase app the connector should use.
     * @param config - A firebase-admin AppOptions configuration object.
     * @param dbPrefix - Prefix for table names (default: 'bgio_').
     * @param ignoreUndefinedProperties - Set to false to disable (default: true).
     * @param useCompositeIndexes - List matches using compound queries (default: false).
     */
    constructor({
        appName,
        config,
        dbPrefix = DB_PREFIX,
        ignoreUndefinedProperties = true,
        useCompositeIndexes = false,
    }: {
        appName?: string;
        config: FirebaseOptions;
        dbPrefix?: string;
        ignoreUndefinedProperties?: boolean;
        useCompositeIndexes?: boolean;
    }) {
        super();
        // this.client = admin;
        // const hasNoInitializedApp = this.client.apps.length === 0;
        // const isNamedAppUninitialized =
        //     app && !this.client.apps.some((a) => a && a.name === app);
        // if (hasNoInitializedApp || isNamedAppUninitialized) {
        //     this.client.initializeApp(config, app);
        // }
        const app = initializeApp(config);
        // this.db = this.client.app(app).firestore();
        this.db = initializeFirestore(app, { ignoreUndefinedProperties });
        this.useCompositeIndexes = useCompositeIndexes;
        this.metadata = collection(this.db, dbPrefix + DBTable.Metadata);
        this.state = collection(this.db, dbPrefix + DBTable.State);
        this.initialState = collection(
            this.db,
            dbPrefix + DBTable.InitialState,
        );
        this.log = collection(this.db, dbPrefix + DBTable.Log);
    }

    async connect(): Promise<void> {
        // No-op, but required by boardgame.io
    }

    async createMatch(
        matchID: string,
        opts: StorageAPI.CreateMatchOpts,
    ): Promise<void> {
        await writeBatch(this.db)
            .set(doc(this.metadata, matchID), extendMatchData(opts.metadata))
            .set(doc(this.state, matchID), opts.initialState)
            .set(doc(this.initialState, matchID), opts.initialState)
            .set(doc(this.log, matchID), { log: [] })
            .commit();
    }

    setState(
        matchID: string,
        state: State,
        deltalog?: LogEntry[],
    ): Promise<void> {
        return runTransaction(this.db, async (transaction) => {
            const stateRef = doc(this.state, matchID);
            // read previous state from the database
            const prevSnapshot = await transaction.get(stateRef);
            const prevState = prevSnapshot.data() as State | undefined;

            // don’t set if database state is newer
            if (!prevState || prevState._stateID < state._stateID) {
                transaction.set(doc(this.state, matchID), state);

                // concatenate log if deltalog is provided
                if (deltalog && deltalog.length > 0) {
                    transaction.update(doc(this.log, matchID), {
                        log: arrayUnion(...deltalog),
                    });
                }
            }
        });
    }

    async setMetadata(
        matchID: string,
        metadata: Server.MatchData,
    ): Promise<void> {
        const extendedMatchData = extendMatchData(metadata);
        await setDoc(doc(this.metadata, matchID), extendedMatchData);
    }

    fetch<O extends StorageAPI.FetchOpts>(
        matchID: string,
        opts: O,
    ): Promise<StorageAPI.FetchResult<O>> {
        return runTransaction(this.db, async (transaction) => {
            const result = {} as StorageAPI.FetchFields;
            const requests: Promise<void>[] = [];

            // Check if each fetch field is included in the options object
            // and if so, launch a get request for its data.
            for (const table of tables) {
                if (!opts[table]) continue;
                // Launch get request for this document type
                const fetch = transaction
                    .get(doc(this[table], matchID))
                    .then((snapshot) => {
                        // Read returned data
                        const data = snapshot.data() as
                            | undefined
                            | (State & {
                                  log: LogEntry[];
                              } & ExtendedMatchData);
                        // Add data to the results map
                        if (data) {
                            if (table === DBTable.Log) {
                                // Handle log storage format to return array
                                result[table] = data.log;
                            } else if (table === DBTable.Metadata) {
                                // Strip bgio-firebase fields from metadata.
                                result[table] = standardiseMatchData(data);
                            } else {
                                result[table] = data;
                            }
                        }
                    });
                requests.push(fetch);
            }

            await Promise.all(requests);
            return result;
        });
    }

    watchMatchState(matchID: string, callback: (matchData: any) => void) {
        return onSnapshot(doc(this.state, matchID), (doc) => {
            callback(doc.data());
        });
    }

    async wipe(matchID: string): Promise<void> {
        await writeBatch(this.db)
            .delete(doc(this.metadata, matchID))
            .delete(doc(this.state, matchID))
            .delete(doc(this.initialState, matchID))
            .delete(doc(this.log, matchID))
            .commit();
    }

    async listMatches({
        gameName,
        where: whereParams = {},
    }: StorageAPI.ListMatchesOpts = {}): Promise<string[]> {
        let ref: Query = this.metadata;

        // Filter by updatedAt time if requested.
        let hasDateFilter = false;
        if (whereParams.updatedAfter !== undefined) {
            hasDateFilter = true;
            ref = query(ref, where("updatedAt", ">", whereParams.updatedAfter));
        }
        if (whereParams.updatedBefore !== undefined) {
            hasDateFilter = true;
            ref = query(
                ref,
                where("updatedAt", "<", whereParams.updatedBefore),
            );
        }

        // Only add equality queries if no range query is present or composite
        // indexes are enabled.
        const needsEqualityQueries =
            gameName !== undefined || whereParams.isGameover !== undefined;
        const canUseEqualityQueries =
            this.useCompositeIndexes || !hasDateFilter;
        if (needsEqualityQueries && canUseEqualityQueries) {
            // Filter by game name.
            if (gameName !== undefined)
                ref = query(ref, where("gameName", "==", gameName));
            // Filter by gameover state.
            if (whereParams.isGameover === true) {
                ref = query(ref, where("isGameover", "==", true));
            } else if (whereParams.isGameover === false) {
                ref = query(ref, where("isGameover", "==", false));
            }
        }

        const docs = await getDocs(ref);
        const ids: string[] = [];
        const needsManualFiltering =
            needsEqualityQueries && !canUseEqualityQueries;
        docs.forEach((doc) => {
            if (needsManualFiltering) {
                const data = doc.data() as ExtendedMatchData;
                if (
                    (gameName !== undefined && data.gameName !== gameName) ||
                    (whereParams.isGameover === false &&
                        data.isGameover !== false) ||
                    (whereParams.isGameover === true &&
                        data.isGameover !== true)
                ) {
                    return;
                }
            }
            ids.push(doc.id);
        });
        return ids;
    }
}
