import { useNavigate } from "react-router-dom";
import { GameButton } from "../components/GameButton";
import { useCollection } from "react-firebase-hooks/firestore";
import { ClientFirestoreStorage } from "../firestore/ClientFirestoreStorage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Server } from "boardgame.io";
import Icon from "@mdi/react";
import { mdiDelete } from "@mdi/js";
import _ from "lodash";
import { LOCAL_STORAGE_MATCH_PREFIX } from "../constants";

const makeId = (length = 6) => {
    let ID = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
        ID += characters.charAt(Math.floor(Math.random() * 36));
    }
    return ID.toLowerCase();
};

const storage = new ClientFirestoreStorage({});

type MatchDataWithId = Server.MatchData & { id: string };

export const MatchCreationRoute = () => {
    const navigate = useNavigate();
    const [value, loading, error] = useCollection(storage.metadata);
    const [matchMetadatas, setMatchMetadatas] = useState<MatchDataWithId[]>([]);
    useEffect(() => {
        if (value) {
            const newMatchMetadatas = value.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMatchMetadatas(newMatchMetadatas);
        }
    }, [value]);
    const localStorageItems = { ...localStorage };
    const joinedMatches = _.keys(localStorageItems)
        .map((key) => key.split(LOCAL_STORAGE_MATCH_PREFIX)?.[1])
        .filter((m) => m);

    useEffect(() => {
        // Remove any local storage items that are no longer in the matchMetadatas
        joinedMatches.forEach((matchId) => {
            if (
                matchMetadatas.length &&
                !matchMetadatas.find((m) => m.id === matchId)
            ) {
                localStorage.removeItem(
                    `${LOCAL_STORAGE_MATCH_PREFIX}${matchId}`,
                );
            }
        });
    }, [joinedMatches]);

    const [gameName, setGameName] = useState("");
    const [onlyMyGames, setOnlyMyGames] = useState(true);

    const matchesToShow = onlyMyGames
        ? matchMetadatas.filter((m) => joinedMatches.includes(m.id))
        : matchMetadatas;

    const uniquePostfix = useMemo(() => makeId(), []);

    const gameNameToId = useCallback(
        (name: string) => {
            // If i paginate or look up subset in future, will need to update:
            let postfix = "";
            const urlSafeName = encodeURIComponent(
                name.toLowerCase().replace(" ", "-"),
            );
            if (!urlSafeName) {
                return uniquePostfix;
            } else if (matchMetadatas.find((m) => m.id === urlSafeName)) {
                postfix = `-${uniquePostfix}`;
            }
            const id = `${urlSafeName}${postfix}`;
            return id;
        },
        [matchMetadatas],
    );
    const [gameId, setGameId] = useState(uniquePostfix);
    const debouncedGameNameToId = useMemo(
        () =>
            _.debounce((name) => {
                const id = gameNameToId(name);
                setGameId(id);
            }, 500),
        [gameNameToId],
    );
    useEffect(() => {
        debouncedGameNameToId(gameName);
    }, [gameName, debouncedGameNameToId]);

    return (
        <div className="flex overflow-auto flex-col justify-center items-center pt-2 w-full max-w-md gap-4">
            <div className="w-full max-w-sm flex-shrink-0 flex flex-col gap-1">
                <input
                    type="text"
                    placeholder="Game Name (optional)"
                    value={gameName}
                    onChange={(e) => {
                        setGameName(e.target.value);
                    }}
                    className="input input-bordered input-accent"
                />
                <span className="self-start pl-4">({gameId})</span>
            </div>
            <GameButton
                onClick={() => {
                    navigate(gameNameToId(gameName));
                }}
                className="btn-lg"
            >
                Create New Game
            </GameButton>
            {matchMetadatas.length > 0 && (
                <div className="w-full">
                    <h3 className="w-fit">Join Existing Game:</h3>
                </div>
            )}
            <div className="flex items-center self-start">
                <label className="label flex gap-2">
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={onlyMyGames}
                        onChange={(e) => {
                            setOnlyMyGames(e.target.checked);
                        }}
                    />
                    My games
                </label>
            </div>
            <div className="flex flex-col gap-3 overflow-auto w-full">
                {matchesToShow
                    .sort((a, b) => {
                        return a.createdAt > b.createdAt ? -1 : 1;
                    })
                    .map((matchMetadata, i) => (
                        <div key={i}>
                            <div className="join flex">
                                <button
                                    onClick={() => {
                                        navigate(`/${matchMetadata.id}`);
                                    }}
                                    className="btn btn-lg btn-primary join-item flex-1 flex justify-between"
                                >
                                    <span>{matchMetadata.id}</span>
                                    <span>
                                        Players:{" "}
                                        {
                                            _.values(
                                                matchMetadata?.players,
                                            )?.filter((p) => p?.data?.joined)
                                                ?.length
                                        }{" "}
                                        / 12
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        void storage.wipe(matchMetadata.id);
                                    }}
                                    className="btn btn-lg btn-error join-item"
                                >
                                    <Icon path={mdiDelete} size={1} />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
