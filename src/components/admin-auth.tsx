import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Label, SystemFrame } from '@/components/system-frame';
import { signInOrganizer, watchFirebaseAuth } from '@/lib/firebase-client';

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => watchFirebaseAuth((next) => { setUser(next?.email === 'sai@breakingbug.local' ? next : null); setReady(true); }), []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInOrganizer(username, password);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Organizer authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <SystemFrame step="00" eyebrow="ORGANIZER AUTH"><section className="grid flex-1 place-items-center"><div className="font-mono text-[10px] uppercase tracking-[.12em] text-dim">Authenticating control room...</div></section></SystemFrame>;
  if (user) return <>{children}</>;

  return <SystemFrame step="00" eyebrow="ORGANIZER AUTH"><section className="grid flex-1 place-items-center py-8"><form onSubmit={submit} className="system-card w-full max-w-md p-6"><div className="flex items-center gap-3"><LockKeyhole size={18} className="text-secure"/><div><Label>Restricted access</Label><h1 className="mt-2 text-3xl font-medium tracking-[-.04em] text-[#e7e1d2]">Control room.</h1></div></div><p className="mt-4 text-sm leading-6 text-dim">Organizer credentials are required before any Firebase-backed control actions are loaded.</p><label className="mt-6 block font-mono text-[10px] uppercase tracking-[.1em] text-dim">Name<input autoComplete="username" value={username} onChange={(e)=>setUsername(e.target.value)} className="input-system mt-2 w-full px-3 py-3 text-sm" placeholder="Sai"/></label><label className="mt-4 block font-mono text-[10px] uppercase tracking-[.1em] text-dim">Password<input autoComplete="current-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="input-system mt-2 w-full px-3 py-3 text-sm" placeholder="••••••••"/></label>{error&&<p role="alert" className="mt-4 border border-[#a34b48] p-3 text-xs text-[#c66b65]">{error}</p>}<button data-testid="admin-login" type="submit" disabled={busy} className="system-button mt-6 min-h-10 w-full border border-[#d8d0bb] bg-[#d8d0bb] px-4 font-mono text-[10px] uppercase tracking-[.12em] text-[#111719] disabled:cursor-not-allowed disabled:opacity-40">{busy?'Authenticating...':'Enter control room'}</button><p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[.08em] text-dim">Organizer identity: Sai</p></form></section></SystemFrame>;
}
