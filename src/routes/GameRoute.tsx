import { getDocs, collection } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { DiceyDartsClientGame } from "../DiceyDartsClientGame";
import { firestoreDb } from "../firestore/firestoreDb";

const querySnapshot = await getDocs(collection(firestoreDb, "lobbies"));
console.log("Lobbies:", querySnapshot.size);
querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
});

export const GameRoute = () => {
    const { lobbyId } = useParams<{ lobbyId: string }>();

    if (lobbyId === undefined) {
        throw new Error("Lobby ID is undefined");
    }

    return <DiceyDartsClientGame lobbyId={lobbyId} />;
};
