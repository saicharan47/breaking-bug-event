export type PublicOption = { id: string; label: string };

export type PublicDebugQuestion = {
  id: number;
  topic: string;
  code: string;
  prompt: string;
  options: PublicOption[];
};

const questionSeeds: Array<[string, string, string, string[]]> = [
  ['Bounds check', 'for (let i = 0; i <= items.length; i++) { total += items[i]; }', 'What is the defect in this loop?', ['Array index out of bounds', 'Missing return statement', 'Incorrect comparison', 'Infinite loop']],
  ['Async cleanup', 'useEffect(() => { const id = setInterval(sync, 1000); }, []);', 'Which recovery is required before this component unmounts?', ['Clear the interval', 'Memoize the JSX', 'Add a reducer', 'Parse the ID']],
  ['Null path', 'const name = response.user.profile.name;', 'What makes this access unsafe?', ['profile may be absent', 'response is immutable', 'name must be numeric', 'user is a reserved word']],
  ['Promise path', 'fetch(url).then(parse).catch(report); save();', 'What is the likely ordering issue?', ['save runs before the request finishes', 'catch runs first', 'parse blocks the UI', 'fetch cannot accept a URL']],
  ['Mutable state', 'state.items.push(nextItem); setState(state);', 'Why may the update be ignored?', ['the existing object was mutated', 'push is asynchronous', 'setState accepts arrays only', 'state is a keyword']],
  ['Resource leak', 'const socket = new WebSocket(url); socket.onmessage = onMessage;', 'What should be added to the teardown?', ['socket.close()', 'socket.open()', 'socket.flush()', 'socket.pause()']],
  ['Auth boundary', 'if (role === "admin") renderControls();', 'What is missing for a secure boundary?', ['server-side authorization', 'a second button', 'a CSS class', 'a longer role name']],
  ['Stale closure', 'setCount(count + 1); setCount(count + 1);', 'How should this double increment be written?', ['use functional updates', 'use a string count', 'wrap in JSON', 'remove setCount']],
  ['SQL safety', 'db.query(`SELECT * FROM logs WHERE id = ${id}`);', 'What is the primary risk?', ['SQL injection', 'deadlock', 'CSS injection', 'stack overflow']],
  ['Race condition', 'if (!loading) { loading = true; startJob(); }', 'Why can two jobs still start?', ['the check and write are not atomic', 'loading is always true', 'startJob is a type', 'if cannot be nested']],
  ['Type boundary', 'function total(value) { return value.toFixed(2); }', 'Which input breaks this function?', ['a non-number value', 'a positive number', 'a value with decimals', 'an integer']],
  ['Cache invalidation', 'cache.set(key, result); updateSource();', 'What must happen after the source changes?', ['invalidate or refresh the cache', 'rename the key', 'sort the result', 'close the cache']],
  ['Error surface', 'try { await run(); } catch (error) { console.log(error.message); }', 'What should an operator also receive?', ['a useful recovery context', 'the full secret', 'a blank message', 'a retry loop']],
  ['Input contract', 'const limit = Number(query.limit); items.slice(0, limit);', 'What should happen when limit is NaN?', ['apply a safe fallback', 'slice with NaN forever', 'throw a DOM event', 'convert it to HTML']],
  ['Key identity', 'rows.map(row => <Row key={Math.random()} row={row} />)', 'Why is this key unstable?', ['it changes every render', 'random is deterministic', 'rows cannot be mapped', 'Row cannot receive props']],
  ['Promise rejection', 'const value = await Promise.all(tasks);', 'How can one failed task affect the group?', ['the aggregate rejects', 'all tasks are cancelled by CSS', 'the value is always empty', 'await makes it synchronous']],
  ['Time drift', 'setTimeout(runAt, target - Date.now());', 'What should a robust scheduler account for?', ['negative or delayed time', 'the browser title', 'an extra semicolon', 'the function name']],
  ['Serialization', 'JSON.parse(payload).items.map(Number);', 'What should be checked first?', ['payload and items shape', 'the viewport width', 'the font weight', 'the CSS cascade']],
  ['Retry storm', 'catch(() => retry());', 'What guard prevents runaway retries?', ['backoff and a retry limit', 'a larger payload', 'a second catch only', 'removing the error']],
  ['Secret handling', 'logger.info("request", { token, headers });', 'What should be removed from this log?', ['credentials and sensitive headers', 'the request label', 'the timestamp', 'all structured fields']],
  ['Memory safety','const value = cache[key]; cache[key] = transform(value);','What should be verified before transforming the value?',['That the key exists and the value has the expected shape','That CSS is loaded','That the browser is maximized','That the key is uppercase']],
  ['Access control','if (user.isAdmin) return secretData;','What is the critical security requirement?',['A server-side authorization check','A hidden button','A longer variable name','A loading spinner']],
  ['Event listener','window.addEventListener("resize", onResize);','What prevents a listener leak?',['Remove the listener during teardown','Call it twice','Wrap it in JSON','Disable the browser']],
  ['Atomic update','balance = balance - amount;','What protects this operation under concurrent requests?',['An atomic transaction or server-side lock','A CSS transition','A random delay','A console log']],
  ['Input validation','const port = parseInt(input, 10); server.listen(port);','What should happen if parsing fails?',['Reject or safely default the invalid input','Listen on NaN','Convert it to HTML','Ignore all errors']],
  ['Dependency drift','package.json allows a broad version range.','What reduces unexpected production changes?',['Lock dependencies and review upgrades','Delete the lockfile','Use random versions','Disable tests']],
  ['Observability','catch (err) { throw new Error("failed"); }','What is lost by replacing the original error blindly?',['Diagnostic context and the original cause','The HTTP method','The CSS class','The function name']],
  ['Concurrency','const current = await read(); await write(current + 1);','Why can increments be lost?',['Two workers can read the same old value','await runs synchronously','write always fails','Numbers cannot be incremented']],
  ['Data exposure','return res.json({user, internalToken});','What should be excluded from the response?',['Internal credentials or secrets','The user identifier','The response status','Public profile fields']],
  ['Boundary testing','validate(age >= 18);','Which tests are most valuable around this boundary?',['Values just below, at, and above 18','Only the value 100','Only negative values','No tests']],
];

const allSeeds = questionSeeds;
export const publicQuestions: PublicDebugQuestion[] = allSeeds.map((seed, index) => {
  const shift = (index * 3) % 4;
  const rotated = seed[3].map((_, j) => seed[3][(j + shift) % 4]);
  return {
    id: index + 1,
    topic: seed[0],
    code: seed[1],
    prompt: seed[2],
    options: rotated.map((label, j) => ({ id: String.fromCharCode(65 + j), label })),
  };
});
