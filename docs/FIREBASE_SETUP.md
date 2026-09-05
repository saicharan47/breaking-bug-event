# Firebase Setup

Breaking Bug uses Firebase Authentication (anonymous sign-in) and Firebase Realtime Database.

## 1. Create / select a Firebase project

Create a Firebase project for the event and register a Web App.

## 2. Enable Authentication

Enable **Anonymous** sign-in under Firebase Authentication.

## 3. Enable Realtime Database

Create a Realtime Database instance and copy its database URL.

## 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the Web App configuration values:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The Firebase Web SDK configuration is safe to ship as client configuration. **Never** put service-account JSON, private keys, or Admin SDK credentials in these variables or in the repository.

## 5. Database shape

The application creates the following main paths:

```text
competition/control
rounds/1/config
rounds/1/questions
teams/{TEAM_CODE}
```

The first organizer/participant connection seeds the 50 demo teams and the default Round 1 question set when the paths are empty.

## 6. Production security

Before event day, replace permissive development rules with rules that:

- allow authenticated participants to read only the data they need;
- prevent participants from changing `advanced`, `integrity`, `netScore`, or organizer control state;
- restrict organizer actions to an authenticated organizer identity;
- prevent one team from reading or modifying another team's private answers.

Do not treat client-side Firebase rules or UI hiding as a substitute for authorization design.
