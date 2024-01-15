import { Link } from "react-router-dom";
import { GameButton } from "../components/GameButton";

export const LobbyCreationRoute = () => {
    // TODO: Create a lobby and redirect to the lobby route

    return (
        <div className="flex h-full flex-col justify-center items-center">
            <Link to="/iZeqRPkKXDP8jXvKBaT1">
                <GameButton className="btn-lg">Start Game</GameButton>
            </Link>
        </div>
    );
};
