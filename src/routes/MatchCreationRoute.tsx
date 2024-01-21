import { useNavigate } from "react-router-dom";
import { GameButton } from "../components/GameButton";

const makeId = (length = 6) => {
    let ID = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
        ID += characters.charAt(Math.floor(Math.random() * 36));
    }
    return ID.toLowerCase();
};

export const MatchCreationRoute = () => {
    const navigate = useNavigate();
    return (
        <div className="flex h-full flex-col justify-center items-center">
            <GameButton
                onClick={() => {
                    const matchId = makeId();
                    navigate(`/${matchId}`);
                }}
                className="btn-lg"
            >
                New Game
            </GameButton>
        </div>
    );
};
