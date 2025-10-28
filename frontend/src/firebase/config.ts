// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables (Vite uses import.meta.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Initialize Firestore with custom database ID if specified
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in production)
export const analytics =
  import.meta.env.MODE === 'production' ? getAnalytics(app) : null;

// Connect to emulators in development
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  const authHost = import.meta.env.VITE_AUTH_EMULATOR_HOST || 'localhost:9099';
  const storageHost = import.meta.env.VITE_STORAGE_EMULATOR_HOST || 'localhost:9199';
  const functionsHost = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || 'localhost:5001';

  console.log('🔥 Using Firebase Emulators');

  // Extract host and port
  const [firestoreHostname, firestorePort] = firestoreHost.split(':');
  const [storageHostname, storagePort] = storageHost.split(':');
  const [functionsHostname, functionsPort] = functionsHost.split(':');

  connectFirestoreEmulator(db, firestoreHostname, parseInt(firestorePort));
  connectAuthEmulator(auth, `http://${authHost}`);
  connectStorageEmulator(storage, storageHostname, parseInt(storagePort));
  connectFunctionsEmulator(functions, functionsHostname, parseInt(functionsPort));
}

export default app;
