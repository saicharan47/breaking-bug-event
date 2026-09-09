const apiKey = 'AIzaSyD5pM0ExZ1fI6FTzytcksy4CkT_zbZQu0c';
const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ returnSecureToken: true }),
});

const body = await response.json().catch(() => ({}));

if (!response.ok) {
  const message = body?.error?.message ?? `HTTP ${response.status}`;
  console.error(`Firebase anonymous-auth smoke test failed: ${message}`);
  process.exit(1);
}

if (!body?.idToken || !body?.localId) {
  console.error('Firebase anonymous-auth smoke test failed: Firebase returned no anonymous user token.');
  process.exit(1);
}

console.log('Firebase anonymous-auth smoke test passed for breaking-bug-01.');
