import { onValue, ref } from 'firebase/database';
import { getFirebaseDatabase, type CompetitionControl } from '@/lib/firebase-client';

export type TakeoverEvent = 'breach_start' | 'system_glitch' | 'critical_alert' | 'message_typing' | 'message_complete' | 'mission_start';

export type RealtimeMessage =
  | { type: 'breach'; issuedAt: number; source: 'organizer' | 'local'; runId?: string }
  | { type: 'reset'; issuedAt: number }
  | { type: 'phase1-start'; issuedAt: number; phase1StartedAt?: number }
  | { type: 'phase1-pause'; issuedAt: number }
  | { type: 'phase1-resume'; issuedAt: number; phase1StartedAt?: number }
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
  if (control.command === 'phase1-start') return { type: 'phase1-start', issuedAt, phase1StartedAt: control.phase1StartedAt };
  if (control.command === 'phase1-pause') return { type: 'phase1-pause', issuedAt };
  if (control.command === 'phase1-resume') return { type: 'phase1-resume', issuedAt, phase1StartedAt: control.phase1StartedAt };
  if (control.command === 'results') return { type: 'results', issuedAt };
  return null;
}

export class FirebaseRealtimeAdapter implements RealtimeAdapter {
  private lastCommandId = '';

  connect(onMessage: (message: RealtimeMessage) => void) {
    let active = true;
    let unsubscribe: (() => void) | undefined;
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
      });
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }

  publish(message: RealtimeMessage) {
    if (message.type === 'breach') {
      void import('@/lib/firebase').then(({ writeControl }) => writeControl('breach', { runId: message.runId }));
    } else if (message.type === 'reset') {
      void import('@/lib/firebase').then(({ resetCompetition }) => resetCompetition());
    } else if (message.type === 'phase1-start') {
      void import('@/lib/firebase').then(({ startSharedPhaseOne }) => startSharedPhaseOne());
    } else if (message.type === 'phase1-pause') {
      void import('@/lib/firebase').then(({ pauseSharedPhaseOne }) => pauseSharedPhaseOne());
    } else if (message.type === 'phase1-resume') {
      void import('@/lib/firebase').then(({ resumeSharedPhaseOne }) => resumeSharedPhaseOne());
    } else if (message.type === 'results') {
      void import('@/lib/firebase').then(({ writeControl }) => writeControl('results'));
    }
  }
}

export const realtime = new FirebaseRealtimeAdapter();

export function publishTakeoverEvent(event: TakeoverEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('breaking-bug:sound', { detail: { event } }));
  }
}
