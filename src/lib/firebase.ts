import { get, onValue, ref, runTransaction, serverTimestamp, set, update, type Unsubscribe } from 'firebase/database';
import type { DebugQuestion, SeedTeam } from '@/data/competition';
import { getFirebaseAuth, getFirebaseDatabase } from '@/lib/firebase-client';
import { publicQuestions, type PublicDebugQuestion } from '@/data/public-questions';

export type RoundConfig = { durationSeconds: number; questionDurationSeconds: number; questionCount: number };
export type TeamRecord = SeedTeam & {
  accessKey: string;
  authUid?: string;
  status: 'connected' | 'in-progress' | 'submitted'; connectedAt?: number; lastSeenAt?: number; runId?: string;
  questionOrder?: number[]; answers?: Record<string, string>; recovery?: number; corruption?: number; integrity?: number;
  netScore?: number; totalTimeSeconds?: number; submittedAt?: number; advanced?: boolean; phase1StartedAt?: number;
};
export type ParticipantTeamRecord = Omit<TeamRecord, 'accessKey'>;
export type CompetitionControl = {
  command: 'standby' | 'breach' | 'phase1-start' | 'phase1-pause' | 'phase1-resume' | 'phase1-restart' | 'results' | 'reset';
  issuedAt?: number; runId?: string; phase1StartedAt?: number; phase1DurationSeconds?: number; pausedAt?: number;
};
const teamPath = (teamCode: string) => `teams/${encodeURIComponent(teamCode.trim().toUpperCase())}`;
const teamClaimPath = (teamCode: string) => `teamClaims/${encodeURIComponent(teamCode.trim().toUpperCase())}`;
export const DEFAULT_ROUND1_CONFIG: RoundConfig = { durationSeconds: 840, questionDurationSeconds: 35, questionCount: 30 };
const firebaseError = (action: string, error: unknown) => { const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: unknown }).code) : 'unknown'; return new Error(`${action} failed (${code}). Check Firebase availability and permissions.`); };

export async function getCompetitionControl() { const db = await getFirebaseDatabase(); if (!db) return null; try { return ((await get(ref(db,'competition/control'))).val() as CompetitionControl|null) ?? null; } catch { return null; } }

export async function ensureTeamsSeeded() {
  const db=await getFirebaseDatabase(); if(!db)return false;
  try {
    const { seedTeams } = await import('@/data/competition');
    const snapshot=await get(ref(db,'teams'));
    const existing=snapshot.val() as Record<string,TeamRecord>|null;
    const missing=seedTeams.filter(t=>!existing?.[t.teamCode]);
    if(missing.length){console.warn('[breaking-bug] Missing team records in Firebase; credentials must be provisioned in Firebase before the event.',missing.map(t=>t.teamCode));return false;}
    await ensureRound1Seeded();
    return true;
  } catch(e){ console.warn('[breaking-bug] Firebase team validation failed.',e); return false; }
}

export async function ensureRound1Seeded(){
  const db=await getFirebaseDatabase(); if(!db)return false;
  const qRef=ref(db,'rounds/1/questions'); const pRef=ref(db,'rounds/1/publicQuestions'); const cRef=ref(db,'rounds/1/config');
  try {
    const { debugQuestions } = await import('@/data/competition');
    const publicSeed=Object.fromEntries(debugQuestions.slice(0,30).map(({answer,...q})=>[q.id,q]));
    await runTransaction(qRef,current=>current ?? Object.fromEntries(debugQuestions.slice(0,30).map(q=>[q.id,q])));
    await runTransaction(pRef,current=>current ?? publicSeed);
    await runTransaction(cRef,current=>current ?? DEFAULT_ROUND1_CONFIG);
    return true;
  } catch(e){ console.warn('[breaking-bug] Round seed failed.',e); return false; }
}

export async function getRoundQuestions(round=1){ const db=await getFirebaseDatabase(); if(!db)return [] as DebugQuestion[]; try { const v=(await get(ref(db,`rounds/${round}/questions`))).val(); return v ? Object.values(v) as DebugQuestion[] : []; } catch { return []; } }
export async function getPublicRoundQuestions(round=1):Promise<PublicDebugQuestion[]> { const db=await getFirebaseDatabase(); if(!db)return round===1?publicQuestions:[]; try { const v=(await get(ref(db,`rounds/${round}/publicQuestions`))).val(); return v ? Object.values(v) as PublicDebugQuestion[] : round===1?publicQuestions:[]; } catch { return round===1?publicQuestions:[]; } }
export async function getRoundConfig(round=1){ const db=await getFirebaseDatabase(); if(!db)return DEFAULT_ROUND1_CONFIG; try { return ((await get(ref(db,`rounds/${round}/config`))).val() as RoundConfig|null) ?? DEFAULT_ROUND1_CONFIG; } catch { return DEFAULT_ROUND1_CONFIG; } }

export async function saveRoundQuestions(round:number, questions:DebugQuestion[]){
  const db=await getFirebaseDatabase(); if(!db)throw new Error('Firebase database is unavailable.');
  if(!Number.isInteger(round)||round<1)throw new Error('Invalid round number.');
  if(!questions.length)throw new Error('At least one question is required.');
  const ids=questions.map(q=>q.id); if(new Set(ids).size!==ids.length)throw new Error('Question IDs must be unique.');
  if(questions.some(q=>q.options.length<2||!q.options.some(o=>o.id===q.answer)))throw new Error('Each question must have a valid correct option.');
  const privateQuestions=Object.fromEntries(questions.map(q=>[q.id,q]));
  const publicQuestions=Object.fromEntries(questions.map(({answer,...q})=>[q.id,q]));
  try { await update(ref(db),{[`rounds/${round}/questions`]:privateQuestions,[`rounds/${round}/publicQuestions`]:publicQuestions}); }
  catch(error){ throw firebaseError('Saving Round questions',error); }
}
export async function saveRoundConfig(round:number, config:RoundConfig){
  const db=await getFirebaseDatabase(); if(!db)throw new Error('Firebase database is unavailable.');
  if(!Number.isFinite(config.durationSeconds)||config.durationSeconds<=0||!Number.isFinite(config.questionDurationSeconds)||config.questionDurationSeconds<=0||!Number.isInteger(config.questionCount)||config.questionCount<1)throw new Error('Round 1 timer configuration is invalid.');
  try { await set(ref(db,`rounds/${round}/config`),config); } catch(error){ throw firebaseError('Saving Round configuration',error); }
}

const participantTeamFields = ['authUid','status','connectedAt','lastSeenAt','questionOrder','answers','recovery','corruption','integrity','netScore','totalTimeSeconds','submittedAt','advanced','phase1StartedAt'] as const;
async function readParticipantTeam(teamCode:string):Promise<ParticipantTeamRecord|null>{
  const db=await getFirebaseDatabase(); if(!db)return null;
  const normalized=teamCode.trim().toUpperCase();
  try {
    const values=await Promise.all(participantTeamFields.map(field=>get(ref(db,`${teamPath(normalized)}/${field}`))));
    const teamSeed=(await import('@/data/competition')).seedTeams.find(t=>t.teamCode===normalized);
    const result: Partial<TeamRecord> = {};
    values.forEach((snapshot,index)=>{if(snapshot.exists())(result as Record<string,unknown>)[participantTeamFields[index]]=snapshot.val();});
    if(!result.authUid && !teamSeed)return null;
    return {...teamSeed,...result} as ParticipantTeamRecord;
  } catch { return null; }
}

export async function authenticateTeam(teamCode:string,accessKey:string):Promise<ParticipantTeamRecord|null>{
  const db=await getFirebaseDatabase(); if(!db)return null;
  const normalizedCode=teamCode.trim().toUpperCase(),normalizedKey=accessKey.trim().toUpperCase(),user=getFirebaseAuth().currentUser;
  if(!user?.isAnonymous)return null;
  try {
    const claim=ref(db,teamClaimPath(normalizedCode));
    await set(claim,{uid:user.uid,accessKey:normalizedKey});
    const ownership=await runTransaction(ref(db,`${teamPath(normalizedCode)}/authUid`),current=>current ?? user.uid);
    if(!ownership.committed || ownership.snapshot.val()!==user.uid){await set(claim,null);return null;}
    await set(claim,null);
    return await readParticipantTeam(normalizedCode);
  } catch(error){ console.warn('[breaking-bug] Team authentication failed.',error); return null; }
}
export async function getTeam(teamCode:string):Promise<ParticipantTeamRecord|null>{ return readParticipantTeam(teamCode); }
export async function updateTeam(teamCode:string,patch:Partial<TeamRecord>){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');try{await update(ref(db,teamPath(teamCode)),patch);}catch(error){throw firebaseError(`Updating team ${teamCode}`,error);}}
export function watchTeam(teamCode:string,onTeam:(team:ParticipantTeamRecord|null)=>void):Unsubscribe{
  let stop:Unsubscribe=()=>undefined;
  void getFirebaseDatabase().then(db=>{if(!db)return;const normalized=teamCode.trim().toUpperCase();const listeners=participantTeamFields.map(field=>onValue(ref(db,`${teamPath(normalized)}/${field}`),()=>{void readParticipantTeam(normalized).then(onTeam);},error=>console.warn(`[breaking-bug] Team ${field} listener failed.`,error)));stop=()=>listeners.forEach(unsubscribe=>unsubscribe());void readParticipantTeam(normalized).then(onTeam);});
  return()=>stop();
}
export function watchTeams(onTeams:(teams:TeamRecord[])=>void):Unsubscribe{let stop:Unsubscribe=()=>undefined;void getFirebaseDatabase().then(db=>{if(!db)return;stop=onValue(ref(db,'teams'),s=>{const v=s.val() as Record<string,TeamRecord>|null;onTeams(v?Object.values(v).sort((a,b)=>a.teamCode.localeCompare(b.teamCode)):[]);},error=>console.warn('[breaking-bug] Team list listener failed.',error));});return()=>stop();}
export function watchRoundQuestions(round:number,onQuestions:(q:DebugQuestion[])=>void):Unsubscribe{let stop:Unsubscribe=()=>undefined;void getFirebaseDatabase().then(db=>{if(!db)return;stop=onValue(ref(db,`rounds/${round}/questions`),s=>{const v=s.val();onQuestions(v?Object.values(v) as DebugQuestion[]:[]);},error=>console.warn('[breaking-bug] Question listener failed.',error));});return()=>stop();}
export async function writeControl(command:CompetitionControl['command'],extra:Partial<CompetitionControl>={}){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');try{await set(ref(db,'competition/control'),{command,runId:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,issuedAt:serverTimestamp(),...extra});}catch(error){throw firebaseError(`Writing control state (${command})`,error);}}
export async function startSharedPhaseOne(){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');const { seedTeams } = await import('@/data/competition');const cfg=await getRoundConfig(1);const now=Date.now();try{await set(ref(db,'competition/control'),{command:'phase1-start',runId:`${now}-${Math.random().toString(36).slice(2,8)}`,issuedAt:serverTimestamp(),phase1StartedAt:now,phase1DurationSeconds:cfg.durationSeconds});await Promise.all(seedTeams.map(t=>updateTeam(t.teamCode,{phase1StartedAt:now,status:'in-progress'})));}catch(error){throw firebaseError('Starting Phase 1',error);}}
export async function pauseSharedPhaseOne(){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');try{await update(ref(db,'competition/control'),{command:'phase1-pause',pausedAt:Date.now(),issuedAt:serverTimestamp()});}catch(error){throw firebaseError('Pausing Phase 1',error);}}
export async function resumeSharedPhaseOne(){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');try{const s=await get(ref(db,'competition/control'));const c=s.val() as CompetitionControl|null;if(!c?.pausedAt||!c.phase1StartedAt)throw new Error('Phase 1 is not currently paused.');const shifted=c.phase1StartedAt+(Date.now()-c.pausedAt);await update(ref(db,'competition/control'),{command:'phase1-resume',phase1StartedAt:shifted,pausedAt:null,issuedAt:serverTimestamp()});const { seedTeams } = await import('@/data/competition');await Promise.all(seedTeams.map(t=>updateTeam(t.teamCode,{phase1StartedAt:shifted})));}catch(error){if(error instanceof Error&&error.message.startsWith('Phase 1 is not'))throw error;throw firebaseError('Resuming Phase 1',error);}}
export async function restartSharedPhaseOne(){await startSharedPhaseOne();}
export async function saveTeamAnswer(teamCode:string,questionId:number,answer:string){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');try{await update(ref(db,teamPath(teamCode)),{[`answers/${questionId}`]:answer});}catch(error){throw firebaseError(`Saving answer for ${teamCode}`,error);}}
export async function submitTeamPhaseOne(teamCode:string,_summary?:{recovery:number;corruption:number;integrity:number;netScore:number;totalTimeSeconds:number}){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');try{await update(ref(db,teamPath(teamCode)),{status:'submitted',submittedAt:serverTimestamp()});}catch(error){throw firebaseError(`Submitting Phase 1 for ${teamCode}`,error);}}
export async function computePhaseOneResults(){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');const { seedTeams }=await import('@/data/competition');try{const [teamSnapshot,questions]=await Promise.all([get(ref(db,'teams')),getRoundQuestions(1)]);const values=teamSnapshot.val() as Record<string,TeamRecord>|null;const questionList=questions.slice(0,30);if(!questionList.length)throw new Error('Round 1 question bank is empty.');const submitted=values?Object.values(values).filter(t=>t.status==='submitted').map(t=>{const correct=questionList.reduce((n,q)=>n+(t.answers?.[String(q.id)]===q.answer?1:0),0);const integrity=questionList.length?Math.round(correct/questionList.length*100):0;const submittedAt=Number(t.submittedAt??Date.now());const startedAt=Number(t.phase1StartedAt??submittedAt);const totalTimeSeconds=Math.max(0,Math.round((submittedAt-startedAt)/1000));return {...t,recovery:correct,corruption:questionList.length-correct,integrity,netScore:integrity,totalTimeSeconds};}).sort((a,b)=>(b.integrity??0)-(a.integrity??0)||(a.totalTimeSeconds??Infinity)-(b.totalTimeSeconds??Infinity)):[];const finalists=new Set(submitted.slice(0,25).map(t=>t.teamCode));await Promise.all(seedTeams.map(t=>updateTeam(t.teamCode,{...(finalists.has(t.teamCode)?(submitted.find(s=>s.teamCode===t.teamCode)??{}):{}),advanced:finalists.has(t.teamCode)})));await writeControl('results');return submitted;}catch(error){throw error instanceof Error&&error.message.startsWith('Round 1')?error:firebaseError('Computing Phase 1 results',error);}}
export async function resetCompetition(){const db=await getFirebaseDatabase();if(!db)throw new Error('Firebase database is unavailable.');const { seedTeams }=await import('@/data/competition');try{const snapshot=await get(ref(db,'teams'));const existing=snapshot.val() as Record<string,TeamRecord>|null;await Promise.all(seedTeams.map(t=>{const current=existing?.[t.teamCode];return set(ref(db,teamPath(t.teamCode)),{...t,accessKey:current?.accessKey??'',status:'connected',answers:{},recovery:0,corruption:0,integrity:0,netScore:0,advanced:false})}));await writeControl('reset');}catch(error){throw firebaseError('Resetting competition',error);}}
