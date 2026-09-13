const apiKey = process.env.FIREBASE_API_KEY;

if (!apiKey) {
  console.error('Firebase anonymous-auth smoke test failed: FIREBASE_API_KEY is not configured.');
  process.exit(1);
}

const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    // The Firebase browser key is restricted by HTTP referrer. Mimic a local web app
    // request so the CI smoke test exercises the same browser-key restriction.
    referer: 'http://localhost:5173/',
  },
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

console.log('Firebase anonymous-auth smoke test passed.');
