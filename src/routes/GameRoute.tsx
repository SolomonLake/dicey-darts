import { useParams } from "react-router-dom";
import { GameClient } from "../GameClient";

export const GameRoute = () => {
    const { lobbyId } = useParams<{ lobbyId: string }>();

    if (lobbyId === undefined) {
        throw new Error("Lobby ID is undefined");
    }

    return <GameClient lobbyId={lobbyId} />;
};
