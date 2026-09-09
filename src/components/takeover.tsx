import { useEffect, useRef, useState } from 'react';
import { Radio, Terminal, TriangleAlert, WifiOff, Zap } from 'lucide-react';
import { anomalySignals, criticalLogs, hackerTransmission } from '@/data/takeover';
import { SystemFrame } from '@/components/system-frame';

const transmissionBody = [...hackerTransmission.paragraphs, hackerTransmission.signature].join('\n\n');

type AnomalyScreenProps = {
  team: string;
  demoMode: boolean;
};

export function AnomalyScreen({ team, demoMode }: AnomalyScreenProps) {
  const [frozen, setFrozen] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setFrozen(false), demoMode ? 360 : 720);
    return () => window.clearTimeout(timer);
  }, [demoMode]);

  return (
    <SystemFrame tone="anomaly" step="02" eyebrow="SYSTEM ANOMALY">
      <section className={`anomaly-panel signal-flicker relative flex flex-1 flex-col justify-between p-6 md:p-12 ${frozen ? 'anomaly-freeze' : ''}`}>
        <div className="absolute inset-x-0 top-0 h-px bg-[#b87458] opacity-70" />
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.15em] text-[#c4886b]">
            <WifiOff size={14} />
            secure channel interrupted
          </div>
          <h1 className="mt-8 max-w-3xl text-5xl font-medium uppercase leading-[.9] tracking-[-.055em] text-[#d1a08a] md:text-8xl">
            Something is<br />wrong.
          </h1>
          <p className="mt-8 max-w-lg font-mono text-xs leading-6 text-[#b88370]">
            {frozen ? 'signal frozen / awaiting recovery...' : anomalySignals[1]}
          </p>
        </div>
        <div className="mt-16 grid gap-6 border-t border-[rgba(169,112,78,.35)] pt-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2 font-mono text-[10px] uppercase leading-5 tracking-[.08em] text-[#9c7465]">
            <p><span className="text-[#d1a08a]">TEAM /</span> {team || 'BYTE-KNIGHTS'}</p>
            <p><span className="text-[#d1a08a]">STATUS /</span> operator heartbeat lost</p>
            <p><span className="text-[#d1a08a]">NOTICE /</span> do not refresh this channel</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.12em] text-[#d17b68]">
            <span className="status-dot status-dot-red animate-pulse-line" />
            anomaly in progress
          </div>
        </div>
      </section>
    </SystemFrame>
  );
}

type BreachScreenProps = {
  breachStep: number;
  demoMode: boolean;
};

export function BreachScreen({ breachStep, demoMode }: BreachScreenProps) {
  const [cursor, setCursor] = useState(0);
  const blackout = breachStep >= 4;

  useEffect(() => {
    if (blackout) return undefined;
    const timer = window.setInterval(() => {
      setCursor((value) => (value + 1) % criticalLogs.length);
    }, demoMode ? 105 : 165);
    return () => window.clearInterval(timer);
  }, [blackout, demoMode]);

  if (blackout) {
    return (
      <SystemFrame tone="breach" step="03" eyebrow="BLACKOUT">
        <section className="blackout-in -mx-5 flex flex-1 items-center justify-center bg-[#030304] text-center md:-mx-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#b64a46]">terminal state / irreversible</p>
            <h1 className="mt-6 text-4xl font-medium uppercase leading-none tracking-[-.05em] text-[#ddbbb0] md:text-7xl">System breach<br />detected</h1>
          </div>
        </section>
      </SystemFrame>
    );
  }

  const visibleLogs = Array.from({ length: 6 }, (_, index) => criticalLogs[(cursor + index) % criticalLogs.length]);
  return (
    <SystemFrame tone="breach" step="03" eyebrow="BREACH IN PROGRESS">
      <section className="breach-environment breach-shake breach-flash flex flex-1 flex-col justify-between p-5 md:p-10">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.15em] text-[#d0786d]">
            <span className="flex items-center gap-3"><TriangleAlert size={14} /> unauthorized control transfer</span>
            <span className="flex items-center gap-2 text-[#b64a46]"><Zap size={12} /> threat critical</span>
          </div>
          <h1 className="chroma-shift relative mt-8 max-w-3xl text-5xl font-medium uppercase leading-[.88] tracking-[-.06em] text-[#d27a70] md:text-8xl">
            Control plane<br />compromised.
          </h1>
          <p className="mt-7 max-w-xl font-mono text-xs leading-6 text-[#ad6b65]">
            Containment has failed. Do not trust the status indicators below.
          </p>
        </div>
        <div className="breach-log relative z-10 mt-12 overflow-hidden p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[rgba(169,69,65,.35)] pb-3 font-mono text-[9px] uppercase tracking-[.14em] text-[#9f5c58]">
            <span className="flex items-center gap-2"><Terminal size={12} /> critical event stream</span>
            <span>feed / LIVE</span>
          </div>
          <div className="space-y-2 font-mono text-[10px] leading-5 text-[#b97971]">
            {visibleLogs.map((log, index) => (
              <p key={`${log.stamp}-${index}`} className={log.level === 'CRIT' || log.level === 'ROOT' ? 'text-[#d6877a]' : 'text-[#a86f69]'}>
                <span className="mr-3 text-[#87514f]">{log.stamp}</span>
                <span className="mr-3 text-[#d08a7d]">[{log.level}]</span>
                {log.message}
              </p>
            ))}
          </div>
        </div>
        <div className="relative z-10 mt-8 flex flex-wrap justify-between gap-3 border-t border-[rgba(169,69,65,.42)] pt-4 font-mono text-[9px] uppercase tracking-[.12em] text-[#925c58]">
          <span>TRACE / 192.24.05.42</span>
          <span>{demoMode ? 'ACCELERATED SEQUENCE' : 'LIVE SEQUENCE'}</span>
          <span>AUTHORITY / ROOT</span>
        </div>
      </section>
    </SystemFrame>
  );
}

export function TakeoverScreen() {
  return (
    <SystemFrame tone="breach" step="04" eyebrow="CONTROL OVERRIDE">
      <section className="flex flex-1 items-center justify-center py-16 text-center">
        <div className="animate-rise">
          <div className="mx-auto flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[.23em] text-[#c26b64]"><Radio size={14} /> remote operator connected</div>
          <h1 className="mt-8 text-5xl font-medium uppercase leading-[.86] tracking-[-.065em] text-[#e1b2a7] md:text-8xl">Connection<br />hijacked</h1>
          <p className="mt-8 font-mono text-xs uppercase tracking-[.16em] text-[#a26761]">You&apos;re not in control anymore.</p>
        </div>
      </section>
    </SystemFrame>
  );
}

type HackerTransmissionScreenProps = { onComplete?: () => void };

export function HackerTransmissionScreen({ onComplete }: HackerTransmissionScreenProps) {
  const [typed,setTyped]=useState(''); const [bodyComplete,setBodyComplete]=useState(false); const [closeCount,setCloseCount]=useState(0);
  useEffect(()=>{let i=0;let timer=0;const write=()=>{i++;setTyped(transmissionBody.slice(0,i));if(i>=transmissionBody.length){setBodyComplete(true);return;}const ch=transmissionBody[i-1];const pause=ch==='.'||ch===','?260:ch==='\n'?360:0;timer=window.setTimeout(write,13+pause)};timer=window.setTimeout(write,300);return()=>clearTimeout(timer)},[]);
  useEffect(()=>{if(!bodyComplete)return;let i=0;let timer=0;const reveal=()=>{i++;setCloseCount(i);if(i<hackerTransmission.closing.length)timer=window.setTimeout(reveal,520);else if(onComplete)timer=window.setTimeout(onComplete,1100)};timer=window.setTimeout(reveal,420);return()=>clearTimeout(timer)},[bodyComplete,onComplete]);
  return <SystemFrame tone="breach" step="05" eyebrow="INCOMING TRANSMISSION"><section className="transmission-screen flex flex-1 flex-col justify-center py-10 md:py-16"><div className="max-w-3xl"><div className="space-y-2 border-l border-[#8f4847] pl-4 font-mono text-[9px] uppercase leading-5 tracking-[.12em] text-[#9e6863]">{hackerTransmission.metadata.map(line=><p key={line}>{line}</p>)}</div><div className="mt-12 min-h-[280px] max-w-2xl font-mono text-sm leading-8 text-[#d2c2b4] md:text-base"><p className="transmission-copy">{typed}<span className="typing-cursor ml-1 inline-block h-4 w-px translate-y-[2px] bg-[#c47a6e]" /></p></div><div className="mt-10 min-h-[112px] space-y-3 border-t border-[rgba(143,72,71,.38)] pt-5 font-mono text-[10px] uppercase tracking-[.13em] text-[#b7786f]">{hackerTransmission.closing.slice(0,closeCount).map((line,index)=><p key={line} className={index===0?'text-[#d0a091]':''}>{line}</p>)}{closeCount>=hackerTransmission.closing.length&&<p className="mt-5 text-[#d0a091]">STANDING BY FOR MISSION DISPATCH — AWAITING ORGANIZER AUTHORITY</p>}</div></div></section></SystemFrame>;
}
