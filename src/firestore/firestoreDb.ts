import {
    FirebaseApp,
    FirebaseOptions,
    getApp,
    initializeApp,
} from "firebase/app";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
} from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyArm65a0OQ0uhbOP5yzWL9Kz-dt2ILXHd8",
    authDomain: "dicey-darts.firebaseapp.com",
    projectId: "dicey-darts",
    storageBucket: "dicey-darts.appspot.com",
    messagingSenderId: "684825016551",
    appId: "1:684825016551:web:3cae89391b14521b52ca42",
    measurementId: "G-5R3HS73MGC",
};

export const getFirestoreDb = ({
    ignoreUndefinedProperties = true,
    config = firebaseConfig,
}: {
    ignoreUndefinedProperties?: boolean;
    config?: FirebaseOptions;
}) => {
    // this.client = admin;
    // const hasNoInitializedApp = this.client.apps.length === 0;
    // const isNamedAppUninitialized =
    //     app && !this.client.apps.some((a) => a && a.name === app);
    // if (hasNoInitializedApp || isNamedAppUninitialized) {
    //     this.client.initializeApp(config, app);
    // }
    let app: FirebaseApp | undefined;
    try {
        app = getApp();
    } catch (e) {
        // no-op
    }
    if (!app) {
        app = initializeApp(config);
    }
    let db;
    try {
        db = initializeFirestore(app, {
            ignoreUndefinedProperties,
            localCache: persistentLocalCache(/*settings*/ {}),
        });
    } catch (e) {
        console.error(e);
        db = getFirestore(app);
    }
    return db;
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
// export const firestoreDb = getFirestore(app);

// Connect to the local emulator if running
// connectFirestoreEmulator(db, "127.0.0.1", 8080);
