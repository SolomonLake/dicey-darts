import { useNavigate } from "react-router-dom";
import { GameButton } from "../components/GameButton";
import { useCollection } from "react-firebase-hooks/firestore";
import { ClientFirestoreStorage } from "../firestore/ClientFirestoreStorage";
import { useEffect, useState } from "react";
import { Server } from "boardgame.io";
import Icon from "@mdi/react";
import { mdiDelete } from "@mdi/js";

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

    const [gameName, setGameName] = useState("");

    return (
        <div className="flex overflow-auto flex-col justify-center items-center pt-2 w-full max-w-md gap-2">
            <input
                type="text"
                placeholder="Game Name (optional)"
                value={gameName}
                onChange={(e) => {
                    setGameName(e.target.value);
                }}
                className="input input-bordered input-accent w-full max-w-sm flex-shrink-0"
            />
            <GameButton
                onClick={() => {
                    const matchId = makeId();
                    navigate(
                        `/${encodeURIComponent(gameName.replace(" ", "-"))}${
                            gameName ? "-" : ""
                        }${matchId}`,
                    );
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
            <div className="flex flex-col gap-3 overflow-auto w-full">
                {matchMetadatas.map((matchMetadata, i) => (
                    <div key={i}>
                        <div className="join flex">
                            <button
                                onClick={() => {
                                    navigate(`/${matchMetadata.id}`);
                                }}
                                className="btn btn-lg btn-primary join-item flex-1"
                            >
                                {matchMetadata.id}
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
