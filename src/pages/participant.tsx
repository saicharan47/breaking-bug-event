import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronRight, LockKeyhole, RotateCcw } from 'lucide-react';
import { chambers, demoCredentials } from '@/data/competition';
import { transientHackerMessages } from '@/data/takeover';
import { useCompetition } from '@/hooks/useCompetition';
import { Button, Label, SystemFrame, Timer } from '@/components/system-frame';
import { AnomalyScreen, BreachScreen, HackerTransmissionScreen, TakeoverScreen } from '@/components/takeover';

export function ParticipantPage() {
  const competition = useCompetition();
  if (competition.stage === 'access' || competition.stage === 'authenticating') return <AccessScreen {...competition} />;
  if (competition.stage === 'standby') return <StandbyScreen {...competition} />;
  if (competition.stage === 'anomaly') return <AnomalyScreen team={competition.team} demoMode={false} />;
  if (competition.stage === 'breach') return <BreachScreen {...competition} />;
  if (competition.stage === 'takeover') return <TakeoverScreen />;
  if (competition.stage === 'transmission') return <HackerTransmissionScreen onComplete={competition.completeTransmission} />;
  if (competition.stage === 'phase1') return <PhaseOneScreen {...competition} />;
  if (competition.stage === 'results') return <ResultsScreen {...competition} />;
  if (competition.stage === 'mission') return <MissionScreen {...competition} />;
  if (competition.stage === 'chambers') return <ChambersScreen {...competition} />;
  return <RestoredScreen {...competition} />;
}

function AccessScreen({ stage, authenticate, authError }: ReturnType<typeof useCompetition>) {
  const [teamCode, setTeamCode] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (!teamCode.trim() || !accessKey.trim()) return setError('Both credentials are required.');
    setError('');
    void authenticate(teamCode, accessKey);
  };
  const authenticating = stage === 'authenticating';
  return (
    <SystemFrame>
      <section className="animate-rise grid flex-1 items-center gap-12 py-8 md:grid-cols-[1fr_360px] md:py-14">
        <div className="max-w-2xl">
          <Label>Team access / secure channel</Label>
          <h1 className="mt-5 text-5xl font-medium leading-[.95] tracking-[-.06em] text-[#e7e1d2] md:text-7xl">Enter the<br />portal.</h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-dim">Authenticate your team to establish a secure channel. Once connected, remain on standby for mission dispatch.</p>
          <div className="mt-14 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.12em] text-secure"><span className="status-dot status-dot-green" /> channel awaiting team</div>
        </div>
        <div className="system-card p-6 md:p-8">
          <div className="mb-7 flex items-start justify-between"><div><Label>Team access</Label><p className="mt-2 font-mono text-[11px] text-[#d8d0bb]">AUTH / 001</p></div><LockKeyhole size={17} className="text-dim" /></div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[.12em] text-dim">Team code</label>
          <input data-testid="input-team-code" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} className="input-system mb-5 h-11 w-full px-3 font-mono text-xs uppercase" placeholder="KNIGHT-4401" disabled={authenticating} />
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[.12em] text-dim">Access key</label>
          <input data-testid="input-access-key" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} className="input-system mb-3 h-11 w-full px-3 font-mono text-xs" placeholder="BUG-2024" type="password" disabled={authenticating} />
           {(error || authError) && <p data-testid="status-auth-error" className="mb-4 text-xs text-breach">{error || authError}</p>}
          <Button testId="button-enter-portal" onClick={submit} disabled={authenticating}>{authenticating ? 'Authenticating...' : 'Enter portal'} <ArrowRight size={13} className="ml-3 inline" /></Button>
          <div className="mt-7 border-t border-[hsl(var(--border))] pt-4 font-mono text-[9px] leading-5 text-dim">DEMO CHANNEL<br /><span className="text-[#b7c0b5]">{demoCredentials.teamCode}</span> / <span className="text-[#b7c0b5]">{demoCredentials.accessKey}</span></div>
        </div>
      </section>
    </SystemFrame>
  );
}

function StandbyScreen({ team }: ReturnType<typeof useCompetition>) {
  return <SystemFrame step="02" eyebrow="STANDING BY"><section className="animate-rise flex flex-1 flex-col justify-center py-10"><div className="grid gap-12 md:grid-cols-[1fr_300px]"><div><Label>Secure channel</Label><h1 className="mt-5 text-4xl font-medium tracking-[-.04em] text-[#e7e1d2] md:text-6xl">{team}</h1><div className="mt-4 font-mono text-xs text-dim">TEAM CODE / {team}</div><div className="mt-12 border-l-2 border-[#6e957e] pl-4"><p className="font-mono text-[11px] uppercase tracking-[.12em] text-secure">Standing by</p><p className="mt-2 text-xs text-dim">The organizer will begin the round shortly.</p></div></div><div className="system-card p-6"><Label>System log</Label><div className="mt-5 space-y-3 font-mono text-[10px] text-dim"><p><span className="text-secure">[OK]</span> Credentials verified</p><p><span className="text-secure">[OK]</span> Secure link established</p><p><span className="text-secure">[OK]</span> Encrypted tunnel online</p><p><span className="text-secure">[--]</span> Standing by for mission dispatch</p></div></div></div><div className="mt-16 border-t border-[hsl(var(--border))] pt-5 font-mono text-[10px] text-dim"><span className="status-dot status-dot-green animate-pulse-line mr-3" /> Organizer controls breach and round timing.</div></section></SystemFrame>;
}
function PhaseOneScreen({ questions, questionIndex, answers, answer, nextQuestion, overallSeconds, questionSeconds, integrity, questionReady }: ReturnType<typeof useCompetition>) {
  const question = questions[questionIndex];
  const selected = answers[question.id];
  const [hackerMessage, setHackerMessage] = useState<string | null>(null);
  const [showBegin, setShowBegin] = useState(false);
  const integrityLow = integrity < 60;

  useEffect(() => {
    if (!questionReady) {
      setShowBegin(false);
      return undefined;
    }
    setShowBegin(true);
    const timer = window.setTimeout(() => setShowBegin(false), 1700);
    return () => window.clearTimeout(timer);
  }, [questionIndex, questionReady]);

  useEffect(() => {
    if (!questionReady) return undefined;
    let hideTimer = 0;
    const timer = window.setInterval(() => {
      const message = transientHackerMessages[Math.floor(Math.random() * transientHackerMessages.length)];
      setHackerMessage(message);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setHackerMessage(null), 2600);
    }, 6500);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(hideTimer);
    };
  }, [questionIndex, questionReady]);

  return (
    <SystemFrame step="04" eyebrow="HACKER CONTROL" alarm={integrityLow}>
      <section key={question.id} className={`question-assembly animate-rise grid flex-1 gap-8 py-4 ${integrityLow ? 'integrity-low' : ''}`}>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
            <div>
              <Label>Phase 01 / Debugging protocol</Label>
              <h1 className="mt-3 text-xl text-[#e7e1d2]">Question <span className="font-mono text-[#bd514c]">{String(questionIndex + 1).padStart(2, '0')}</span> <span className="text-dim">of {questions.length}</span></h1>
            </div>
            <div className="text-right"><Label>Time left</Label><Timer seconds={overallSeconds} danger={overallSeconds < 120} /></div>
          </div>
          <div className="mt-8">
            <div className="mb-3 flex justify-between font-mono text-[10px] text-dim"><span>{question.topic}</span><span>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</span></div>
            <div className="h-1 bg-[#20282a]"><div className={`integrity-meter h-1 transition-all ${integrityLow ? 'bg-[#b64a46]' : 'bg-[#8ca793]'}`} style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="mt-3 flex justify-between font-mono text-[9px] uppercase tracking-[.1em] text-dim"><span>System integrity</span><span className={integrityLow ? 'integrity-copy integrity-pulse' : 'text-secure'}>{integrity}%</span></div>
            <pre className="code-block mt-8 overflow-x-auto p-5 text-xs leading-7 text-[#b8c4bd]"><code>{question.code}</code></pre>
            <p className="mt-6 text-sm text-[#e3ddcf]">{question.prompt}</p>
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {question.options.map((option) => <button data-testid={`button-answer-${option.id}`} key={option.id} type="button" disabled={!!selected || !questionReady} onClick={() => answer(option.id)} className={`system-button flex min-h-12 items-center gap-3 border px-4 text-left font-mono text-[10px] uppercase tracking-[.04em] ${selected === option.id ? (option.id === question.answer ? 'border-[#779b82] bg-[rgba(88,125,101,.15)] text-secure' : 'border-[#88403e] bg-[rgba(126,45,43,.18)] text-breach') : selected ? 'border-[hsl(var(--border))] text-dim opacity-60' : 'border-[hsl(var(--border))] text-[#b6bbb1] hover:border-[#819286]'}`}><span className="text-dim">{option.id}</span>{option.label}{selected === option.id && <LockKeyhole size={13} className="ml-auto" />}</button>)}
            </div>
            <div className="mt-5 min-h-5 font-mono text-[10px]">{selected && (selected === question.answer ? <span className="text-secure">CALL ACCEPTED / invariant preserved</span> : <span className="text-breach">BAD CALL / integrity reduced</span>)}</div>
            <div className="mt-3 flex items-center justify-between"><div className="font-mono text-[10px] text-dim">Question timer <span className={questionSeconds < 10 ? 'text-breach' : 'text-[#c6bfae]'}>{questionReady ? `${questionSeconds}s` : '--'}</span></div><Button testId="button-next-question" onClick={nextQuestion} disabled={!selected || !questionReady}>{questionIndex === questions.length - 1 ? 'Lock phase' : 'Next question'} <ArrowRight size={13} className="ml-2 inline" /></Button></div>
          </div>
        </div>
        <aside className="system-card relative self-start p-6 md:block">
          <Label>Hacker feed</Label>
          <div className="mt-5 space-y-3 font-mono text-[10px] leading-4 text-dim"><p>19:43:01 <span className="text-breach">Intrusion in progress.</span></p><p>19:43:04 Access level: root</p><p>19:43:07 Monitoring your moves</p><p>19:43:09 <span className="text-[#c8a49b]">Don&apos;t make mistakes.</span></p><p>19:43:12 We&apos;re watching.</p><p>19:43:16 <span className="text-breach">Good luck.</span></p></div>
          {hackerMessage && <div className="mt-7 border-l border-[#9a4d4b] pl-3 font-mono text-[10px] leading-5 text-[#ca887b] animate-rise">&gt; {hackerMessage}</div>}

        </aside>
        {showBegin && <div className="pointer-events-none fixed bottom-8 left-1/2 z-20 -translate-x-1/2 border border-[rgba(151,179,157,.38)] bg-[#101719] px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-secure animate-rise">&gt; Let&apos;s begin.</div>}
      </section>
    </SystemFrame>
  );
}

function ResultsScreen({ correct, answers, questions, startMission, advanced, integrity }: ReturnType<typeof useCompetition>) {
  return <SystemFrame step="05" eyebrow="RESULT"><section className="animate-rise flex flex-1 flex-col justify-center py-10"><div className="mx-auto w-full max-w-3xl text-center"><div className={`mx-auto grid h-16 w-16 place-items-center border ${advanced ? 'border-[#8ca793] text-secure' : 'border-[#8b6b55] text-[#c69b79]'}`}><Check size={26} /></div><h1 className="mt-8 text-4xl font-medium tracking-[-.05em] text-[#e8e1d2] md:text-6xl">{advanced ? 'Recovery access granted.' : 'Phase one complete.'}</h1><p className="mt-4 text-sm text-dim">{advanced ? 'Your team advanced to the recovery chambers.' : 'Your answers are locked. Awaiting organizer result computation.'}</p><div className="mt-14 grid grid-cols-2 border-y border-[hsl(var(--border))] md:grid-cols-4"><ResultStat label="Correct" value={String(correct).padStart(2, '0')} /><ResultStat label="Wrong" value={String(questions.length - correct).padStart(2, '0')} /><ResultStat label="Integrity" value={`${integrity}%`} /><ResultStat label="Answers" value={String(Object.keys(answers).length).padStart(2, '0')} /></div><div className="mt-12"><Button testId="button-enter-mission" onClick={startMission} disabled={!advanced}>{advanced ? <>Continue to mission control <ArrowRight size={13} className="ml-2 inline" /></> : 'Awaiting top 25 calculation'}</Button></div></div></section></SystemFrame>;
}
function ResultStat({ label, value }: { label: string; value: string }) { return <div className="border-r border-[hsl(var(--border))] px-3 py-6 last:border-r-0"><Label>{label}</Label><div className="mt-3 font-mono text-2xl text-[#d8d0bb]">{value}</div></div>; }

function MissionScreen({ enterChambers, overallSeconds, correct }: ReturnType<typeof useCompetition>) {
  return <SystemFrame step="06" eyebrow="MISSION CONTROL"><section className="animate-rise flex flex-1 flex-col justify-center py-8"><div className="grid gap-12 md:grid-cols-[1fr_340px] md:items-end"><div><Label>Recovery protocol / mission control</Label><h1 className="mt-5 max-w-2xl text-5xl font-medium leading-[.96] tracking-[-.06em] text-[#e7e1d2] md:text-7xl">The line is<br />still holding.</h1><p className="mt-7 max-w-lg text-sm leading-7 text-dim">Phase one cleared with <span className="text-secure">{correct} correct calls</span>. Eight recovery chambers remain between the breach and a clean restore.</p></div><div className="system-card p-6"><div className="flex justify-between"><Label>Mission clock</Label><Timer seconds={overallSeconds} danger={overallSeconds < 120} /></div><div className="mt-6 h-1 bg-[#20282a]"><div className="h-1 w-[25%] bg-[#8ca793]" /></div><div className="mt-3 flex justify-between font-mono text-[10px] text-dim"><span>PHASE 02</span><span>01 / 08</span></div></div></div><div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-[hsl(var(--border))] pt-5 md:flex-row md:items-center"><div className="font-mono text-[10px] text-dim"><span className="text-secure">READY</span> / CHAMBERS HAVE BEEN ARMED</div><Button testId="button-enter-chambers" onClick={enterChambers}>Enter recovery chambers <ArrowRight size={13} className="ml-2 inline" /></Button></div></section></SystemFrame>;
}

function ChambersScreen({ finish, overallSeconds }: ReturnType<typeof useCompetition>) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const chamber = chambers[current];
  const last = current === chambers.length - 1;
  const submit = () => {
    if (!selected) return;
    if (last) finish();
    else { setCurrent((value) => value + 1); setSelected(null); }
  };
  return <SystemFrame step="07" eyebrow="RECOVERY CHAMBERS"><section className="animate-rise flex-1 py-3"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[hsl(var(--border))] pb-5"><div><Label>Chamber {String(chamber.id).padStart(2, '0')} / 08</Label><h1 className="mt-3 text-3xl font-medium tracking-[-.04em] text-[#e7e1d2]">{chamber.name}</h1><p className="mt-2 text-sm text-dim">{chamber.subtitle}</p></div><div className="text-right"><Label>Recovery time</Label><Timer seconds={overallSeconds} danger={overallSeconds < 120} /></div></div><div className="grid gap-10 py-10 md:grid-cols-[160px_1fr]"><div className="flex gap-2 md:flex-col">{chambers.map((item, index) => <div key={item.id} className={`flex items-center gap-2 font-mono text-[10px] ${index === current ? 'text-[#d8d0bb]' : index < current ? 'text-secure' : 'text-dim'}`}><span className={`grid h-7 w-7 place-items-center border ${index === current ? 'border-[#c8bea6]' : index < current ? 'border-[#6f987f]' : 'border-[hsl(var(--border))]'}`}>{index < current ? <Check size={12} /> : String(item.id).padStart(2, '0')}</span><span className="hidden md:block">{item.name}</span></div>)}</div><div className="max-w-2xl"><div className="border-l-2 border-[#6e957e] pl-4 font-mono text-[11px] uppercase leading-6 tracking-[.05em] text-[#b7c6b8]">{chamber.briefing}</div><div className="mt-9 space-y-2">{chamber.options.map((option) => <button data-testid={`button-chamber-${option.id}`} key={option.id} type="button" onClick={() => setSelected(option.id)} className={`flex w-full items-center gap-3 border px-4 py-4 text-left font-mono text-[10px] uppercase tracking-[.04em] ${selected === option.id ? 'border-[#779b82] bg-[rgba(88,125,101,.15)] text-secure' : 'border-[hsl(var(--border))] text-[#b6bbb1] hover:border-[#819286]'}`}><span className="text-dim">{option.id}</span>{option.label}{selected === option.id && <LockKeyhole size={13} className="ml-auto" />}</button>)}</div><div className="mt-8 flex justify-end"><Button testId="button-submit-chamber" onClick={submit} disabled={!selected}>{last ? 'Restore system' : 'Commit recovery'} <ArrowRight size={13} className="ml-2 inline" /></Button></div></div></div></section></SystemFrame>;
}

function RestoredScreen({ reset, correct, questions }: ReturnType<typeof useCompetition>) {
  return <SystemFrame step="08" eyebrow="SYSTEM RESTORED"><section className="animate-rise flex flex-1 flex-col items-center justify-center py-12 text-center"><div className="grid h-20 w-20 place-items-center border border-[#8ca793] text-secure"><Check size={34} /></div><h1 className="mt-8 text-5xl font-medium tracking-[-.06em] text-[#e8e1d2] md:text-7xl">System restored.</h1><p className="mt-5 max-w-md text-sm leading-7 text-dim">You held the line. The recovery record has been sealed and the secure channel is returning to standby.</p><div className="mt-14 grid w-full max-w-lg grid-cols-2 border-y border-[hsl(var(--border))] md:grid-cols-3"><ResultStat label="Phase one" value={`${correct}/${questions.length}`} /><ResultStat label="Chambers" value="08/08" /><ResultStat label="State" value="CLEAR" /></div><button data-testid="button-run-again" type="button" onClick={reset} className="mt-12 font-mono text-[10px] uppercase tracking-[.12em] text-dim hover:text-[#d8d0bb]"><RotateCcw size={13} className="mr-2 inline" /> Run it again</button></section></SystemFrame>;
}
