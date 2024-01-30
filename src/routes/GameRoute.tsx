import { useParams } from "react-router-dom";
import { GameClient } from "../GameClient";

export const GameRoute = () => {
    const { matchId } = useParams<{ matchId: string }>();

    if (matchId === undefined) {
        throw new Error("Lobby ID is undefined");
    }

    return <GameClient matchId={matchId} />;
};
