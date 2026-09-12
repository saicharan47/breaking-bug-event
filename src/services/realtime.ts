import { get, onValue, ref } from 'firebase/database';
import { getFirebaseDatabase, type CompetitionControl } from '@/lib/firebase-client';

export type TakeoverEvent = 'breach_start' | 'system_glitch' | 'critical_alert' | 'message_typing' | 'message_complete' | 'mission_start';

export type RealtimeMessage =
  | { type: 'breach'; issuedAt: number; source: 'organizer' | 'local'; runId?: string }
  | { type: 'reset'; issuedAt: number }
  | { type: 'phase1-start'; issuedAt: number; phase1StartedAt?: number; phase1DurationSeconds?: number; runId?: string }
  | { type: 'phase1-pause'; issuedAt: number; phase1StartedAt?: number; pausedAt?: number; runId?: string }
  | { type: 'phase1-resume'; issuedAt: number; phase1StartedAt?: number; phase1DurationSeconds?: number; runId?: string }
  | { type: 'results'; issuedAt: number }
  | { type: 'presence'; team: string; issuedAt: number }
  | { type: 'takeover-event'; event: TakeoverEvent; issuedAt: number };

export interface RealtimeAdapter {
  connect(onMessage: (message: RealtimeMessage) => void): () => void;
  publish(message: RealtimeMessage): void;
}

function controlToMessage(control: CompetitionControl): RealtimeMessage | null {
  const issuedAt = control.issuedAt ?? Date.now();
  if (control.command === 'breach') return { type: 'breach', issuedAt, source: 'organizer', runId: control.runId };
  if (control.command === 'reset') return { type: 'reset', issuedAt };
  if (control.command === 'phase1-start') return { type: 'phase1-start', issuedAt, phase1StartedAt: control.phase1StartedAt, phase1DurationSeconds: control.phase1DurationSeconds, runId: control.runId };
  if (control.command === 'phase1-pause') return { type: 'phase1-pause', issuedAt, phase1StartedAt: control.phase1StartedAt, pausedAt: control.pausedAt, runId: control.runId };
  if (control.command === 'phase1-resume') return { type: 'phase1-resume', issuedAt, phase1StartedAt: control.phase1StartedAt, phase1DurationSeconds: control.phase1DurationSeconds, runId: control.runId };
  if (control.command === 'results') return { type: 'results', issuedAt };
  return null;
}

export class FirebaseRealtimeAdapter implements RealtimeAdapter {
  private lastCommandId = '';

  connect(onMessage: (message: RealtimeMessage) => void) {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let syncing = false;

    const syncCurrentControl = async () => {
      if (!active || syncing) return;
      syncing = true;
      try {
        const database = await getFirebaseDatabase();
        if (!database || !active) return;
        const snapshot = await get(ref(database, 'competition/control'));
        const control = snapshot.val() as CompetitionControl | null;
        if (!control || !active) return;
        const commandId = `${control.runId ?? ''}:${control.command}:${control.issuedAt ?? ''}`;
        if (commandId === this.lastCommandId) return;
        this.lastCommandId = commandId;
        const message = controlToMessage(control);
        if (message) onMessage(message);
      } catch (error) {
        console.warn('[breaking-bug] Realtime state resync failed.', error);
      } finally {
        syncing = false;
      }
    };

    void getFirebaseDatabase().then((database) => {
      if (!database || !active) return;
      unsubscribe = onValue(ref(database, 'competition/control'), (snapshot) => {
        const control = snapshot.val() as CompetitionControl | null;
        if (!control) return;
        const commandId = `${control.runId ?? ''}:${control.command}:${control.issuedAt ?? ''}`;
        if (commandId === this.lastCommandId) return;
        this.lastCommandId = commandId;
        const message = controlToMessage(control);
        if (message) onMessage(message);
      }, error => console.warn('[breaking-bug] Realtime control listener failed.', error));
      void syncCurrentControl();
    }).catch(error => console.warn('[breaking-bug] Realtime connection failed.', error));

    const resync = () => void syncCurrentControl();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', resync);
      document.addEventListener('visibilitychange', resync);
    }

    return () => {
      active = false;
      unsubscribe?.();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', resync);
        document.removeEventListener('visibilitychange', resync);
      }
    };
  }

  publish(message: RealtimeMessage) {
    if (message.type === 'breach') {
      void import('@/lib/firebase').then(({ writeControl }) => writeControl('breach', { runId: message.runId })).catch(error => console.error('[breaking-bug] Breach control publish failed.', error));
    } else if (message.type === 'reset') {
      void import('@/lib/firebase').then(({ resetCompetition }) => resetCompetition()).catch(error => console.error('[breaking-bug] Reset publish failed.', error));
    } else if (message.type === 'phase1-start') {
      void import('@/lib/firebase').then(({ startSharedPhaseOne }) => startSharedPhaseOne()).catch(error => console.error('[breaking-bug] Phase 1 start publish failed.', error));
    } else if (message.type === 'phase1-pause') {
      void import('@/lib/firebase').then(({ pauseSharedPhaseOne }) => pauseSharedPhaseOne()).catch(error => console.error('[breaking-bug] Phase 1 pause publish failed.', error));
    } else if (message.type === 'phase1-resume') {
      void import('@/lib/firebase').then(({ resumeSharedPhaseOne }) => resumeSharedPhaseOne()).catch(error => console.error('[breaking-bug] Phase 1 resume publish failed.', error));
    } else if (message.type === 'results') {
      void import('@/lib/firebase').then(({ writeControl }) => writeControl('results')).catch(error => console.error('[breaking-bug] Results control publish failed.', error));
    }
  }
}

export const realtime = new FirebaseRealtimeAdapter();

export function publishTakeoverEvent(event: TakeoverEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('breaking-bug:sound', { detail: { event } }));
  }
}
