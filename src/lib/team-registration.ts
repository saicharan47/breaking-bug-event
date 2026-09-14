import { get, ref, update } from 'firebase/database';
import { getFirebaseDatabase } from '@/lib/firebase-client';

const TEST_TEAM_CODE = 'TEST-0001';
const TEST_TEAM_NAME = 'TEAM TEST';
const TEST_TEAM_GMAIL = 'test1@gmail.com';
const COMMON_PARTICIPANT_PASSWORD = 'idontknow';

const directoryKey=(teamName:string)=>teamName.trim().toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');

/** Seeds the organizer-owned test registration. Firebase rules still require organizer auth for this write. */
export async function ensureRegisteredTeamsSeeded(){
  const db=await getFirebaseDatabase();
  if(!db)return false;
  const existing=await get(ref(db,`teams/${TEST_TEAM_CODE}`));
  const current=existing.val() as {name?:string;gmail?:string;password?:string}|null;
  const writes:Record<string,string>={
    [`teams/${TEST_TEAM_CODE}/name`]:TEST_TEAM_NAME,
    [`teams/${TEST_TEAM_CODE}/gmail`]:TEST_TEAM_GMAIL,
    [`teams/${TEST_TEAM_CODE}/password`]:COMMON_PARTICIPANT_PASSWORD,
    [`teamDirectory/${directoryKey(TEST_TEAM_NAME)}`]:TEST_TEAM_CODE,
  };
  await update(ref(db),writes);
  if(!current)console.info(`[breaking-bug] Seeded test team ${TEST_TEAM_CODE}.`);
  return true;
}
