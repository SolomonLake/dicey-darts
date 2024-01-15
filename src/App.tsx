import { Client } from "boardgame.io/react";
import { DiceyDarts } from "./Game";
import { Debug } from "boardgame.io/debug";
import { Local } from "boardgame.io/multiplayer";
import { DiceyDartsBoard } from "./components/DiceyDartsBoard/DiceyDartsBoard";
import { DarkModeSwitcher } from "./components/DarkModeSwitcher/DarkModeSwitcher";
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyArm65a0OQ0uhbOP5yzWL9Kz-dt2ILXHd8",
    authDomain: "dicey-darts.firebaseapp.com",
    projectId: "dicey-darts",
    storageBucket: "dicey-darts.appspot.com",
    messagingSenderId: "684825016551",
    appId: "1:684825016551:web:3cae89391b14521b52ca42",
    measurementId: "G-5R3HS73MGC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Connect to the local emulator if running
// connectFirestoreEmulator(db, "127.0.0.1", 8080);

const querySnapshot = await getDocs(collection(db, "lobbies"));
console.log("Lobbies:", querySnapshot.size);
querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
});

const ClientGame = Client({
    game: DiceyDarts,
    numPlayers: 2,
    board: DiceyDartsBoard,
    debug: {
        impl: Debug,
        collapseOnLoad: true,
    },
    multiplayer: Local({
        // Enable localStorage cache.
        persist: true,
    }),
});

export const App = () => {
    return (
        <div className="flex flex-col w-full place-items-center h-dvh text-center p-5 gap-2 overflow-auto prose prose-stone max-w-none">
            {/* Header */}
            <div className="flex flex-row items-center gap-2">
                <h1 className="mb-0 text-3xl">Dicey Darts</h1>
                <DarkModeSwitcher />
            </div>
            <ClientGame playerID="0" />
        </div>
    );
};
