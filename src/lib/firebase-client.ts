import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Object.values(config).every(Boolean);
let database: Database | null = null;
let authAttempt: Promise<void> | null = null;

export async function getFirebaseDatabase() {
  if (!firebaseConfigured) return null;
  if (!database) {
    const app = getApps().length ? getApp() : initializeApp(config);
    database = getDatabase(app);
    authAttempt ||= signInAnonymously(getAuth(app)).then(() => undefined).catch((error: unknown) => {
      console.warn('[breaking-bug] Anonymous Firebase auth unavailable; continuing with configured database rules.', error);
    });
  }
  await authAttempt;
  return database;
}

export type CompetitionControl = {
  command: 'standby' | 'breach' | 'phase1-start' | 'phase1-pause' | 'phase1-resume' | 'phase1-restart' | 'results' | 'reset';
  issuedAt?: number;
  runId?: string;
  phase1StartedAt?: number;
  phase1DurationSeconds?: number;
  pausedAt?: number;
};
