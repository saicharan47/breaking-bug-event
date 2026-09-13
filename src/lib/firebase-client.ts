import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

// The Firebase Web API key is supplied through the deployment environment.
// Firebase Web App configuration is client-side by design; keep the key
// restricted in Google Cloud/Firebase rather than committing it to Git.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: 'breakingbug-prod.firebaseapp.com',
  databaseURL: 'https://breakingbug-prod-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'breakingbug-prod',
  storageBucket: 'breakingbug-prod.firebasestorage.app',
  messagingSenderId: '280045451159',
  appId: '1:280045451159:web:5d82167cc9fbff2f2d76d2',
  measurementId: 'G-FGYZWGPGZQ',
} as const;

const ORGANIZER_EMAIL = 'saicharan.ak477@gmail.com';
const ORGANIZER_USERNAME = 'sai';

export const firebaseConfigured = Object.values(config).every(Boolean);
let database: Database | null = null;
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let anonymousAuthAttempt: Promise<void> | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!firebaseConfigured) throw new Error('Firebase is not configured.');
  if (!firebaseApp) {
    firebaseApp = getApps().find((candidate) => candidate.options.projectId === config.projectId)
      ?? initializeApp(config, 'breaking-bug');
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

export function watchFirebaseAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInOrganizer(username: string, password: string) {
  if (username.trim().toLowerCase() !== ORGANIZER_USERNAME) throw new Error('Invalid organizer credentials.');
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), ORGANIZER_EMAIL, password);
  if (credential.user.email?.toLowerCase() !== ORGANIZER_EMAIL) {
    await signOut(getFirebaseAuth());
    throw new Error('Organizer account is not authorized.');
  }
  return credential.user;
}

export async function signOutFirebase() {
  await signOut(getFirebaseAuth());
}

async function ensureAnonymousAuth() {
  const currentAuth = getFirebaseAuth();
  if (currentAuth.currentUser && !currentAuth.currentUser.isAnonymous) return;
  anonymousAuthAttempt ||= signInAnonymously(currentAuth)
    .then(() => undefined)
    .catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: unknown }).code) : 'unknown';
      console.error('[breaking-bug] Anonymous Firebase auth failed.', error);
      throw new Error(
        `Firebase anonymous authentication failed (${code}). Verify the Firebase Web App config, API key restrictions, Anonymous Auth, and Authorized Domains.`,
      );
    });
  await anonymousAuthAttempt;
}

export async function getFirebaseDatabase() {
  if (!firebaseConfigured) return null;
  getFirebaseApp();
  await ensureAnonymousAuth();
  if (!database) database = getDatabase(getFirebaseApp());
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
