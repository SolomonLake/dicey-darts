import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
export const firestoreDb = getFirestore(app);

// Connect to the local emulator if running
// connectFirestoreEmulator(db, "127.0.0.1", 8080);
