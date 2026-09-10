import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

function createFirebaseApp(): FirebaseApp {
  const config = {
    apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || process.env["VITE_FIREBASE_API_KEY"],
    authDomain:
      import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || process.env["VITE_FIREBASE_AUTH_DOMAIN"],
    projectId:
      import.meta.env["VITE_FIREBASE_PROJECT_ID"] || process.env["VITE_FIREBASE_PROJECT_ID"],
    storageBucket:
      import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || process.env["VITE_FIREBASE_STORAGE_BUCKET"],
    messagingSenderId:
      import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ||
      process.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
    appId: import.meta.env["VITE_FIREBASE_APP_ID"] || process.env["VITE_FIREBASE_APP_ID"],
  };

  if (!config.apiKey || !config.projectId) {
    const missing = [
      ...(!config.apiKey ? ["VITE_FIREBASE_API_KEY"] : []),
      ...(!config.projectId ? ["VITE_FIREBASE_PROJECT_ID"] : []),
    ];
    const message = `Missing Firebase config: ${missing.join(", ")}. Add it in the Base44 secrets dashboard.`;
    console.error(`[Firebase] ${message}`);
    throw new Error(message);
  }

  return getApps().length > 0 ? getApps()[0]! : initializeApp(config);
}

let _db: Firestore | undefined;

export function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(createFirebaseApp());
  }
  return _db;
}
