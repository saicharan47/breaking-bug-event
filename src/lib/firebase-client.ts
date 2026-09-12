import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

// This is the public Firebase Web App config shown by Firebase Console for
// breakingbug-prod. Firebase web config values are identifiers, not secrets.
// Keeping the console config here prevents a stale/mistyped local .env from
// silently pointing Firebase Auth at the wrong API key.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDZjaSBDWFHod4CCacXK5BjtxWoP5JuaoI',
  authDomain: 'breakingbug-prod.firebaseapp.com',
  databaseURL: 'https://breakingbug-prod-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'breakingbug-prod',
  storageBucket: 'breakingbug-prod.firebasestorage.app',
  messagingSenderId: '280045451159',
  appId: '1:280045451159:web:5d82167cc9fbff2f2d76d2',
  measurementId: 'G-FGYZWGPGZQ',
} as const;

// Keep the environment variables as an explicit opt-in override for a future
// staging project. Production/local Breaking Bug uses the verified console
// configuration above by default.
const useEnvironmentConfig = import.meta.env.VITE_FIREBASE_USE_ENV === 'true';
const config = useEnvironmentConfig
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
      appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
    }
  : FIREBASE_CONFIG;

export const firebaseConfigured = Object.values(config).every(Boolean);
let database: Database | null = null;
let authAttempt: Promise<void> | null = null;

export async function getFirebaseDatabase() {
  if (!firebaseConfigured) return null;
  if (!database) {
    const app = getApps().find((candidate) => candidate.options.projectId === config.projectId)
      ?? initializeApp(config, 'breaking-bug');
    database = getDatabase(app);
    const auth = getAuth(app);
    authAttempt ||= signInAnonymously(auth)
      .then(() => undefined)
      .catch((error: unknown) => {
        const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: unknown }).code) : 'unknown';
        console.error('[breaking-bug] Anonymous Firebase auth failed.', error);
        throw new Error(
          `Firebase anonymous authentication failed (${code}). Verify the Firebase Web App config, API key restrictions, Anonymous Auth, and Authorized Domains.`,
        );
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
