/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_ENV: string;
  readonly VITE_USE_EMULATOR: string;
  readonly VITE_FIRESTORE_EMULATOR_HOST: string;
  readonly VITE_AUTH_EMULATOR_HOST: string;
  readonly VITE_STORAGE_EMULATOR_HOST: string;
  readonly VITE_FUNCTIONS_EMULATOR_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
