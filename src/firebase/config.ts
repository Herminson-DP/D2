import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Attempt local persistence for smooth offline or session handling
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Graceful fallback
});

export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with configured databaseId or default
let firestoreDb: Firestore;
try {
  if (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)') {
    firestoreDb = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (error) {
  console.warn('Initializing default firestore fallback', error);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export default app;
