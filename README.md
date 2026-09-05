# Breaking Bug

> **Think fast. Break systems. Fix the impossible.**

Breaking Bug is a browser-based, realtime debugging and cybersecurity competition platform built for high-pressure campus events. Teams authenticate into a controlled mission environment, survive an organizer-triggered breach sequence, solve timed debugging challenges, and compete for a place beyond the Round 1 **Kill Line**.

## ⚡ What it does

- Secure team access using team code + access key
- Organizer-triggered breach / takeover sequence
- Realtime participant ↔ organizer synchronization
- Shared Round 1 countdown
- Organizer pause, resume and restart controls
- Editable Round 1 question bank
- Configurable round duration, question duration and question count
- Deterministic per-team question shuffling
- Integrity-based scoring
- Automatic Top 25 qualification
- Live organizer leaderboard
- Recovery-chamber experience for advancing teams
- Firebase Realtime Database backend
- React + TypeScript + Vite frontend

## 🎮 Competition Flow

```text
ACCESS
  ↓
STANDBY
  ↓
ANOMALY
  ↓
BREACH
  ↓
TAKEOVER
  ↓
HACKER TRANSMISSION
  ↓
ROUND 1 — KILL LINE
  ↓
RESULTS
  ↓
TOP 25
  ↓
MISSION CONTROL
  ↓
RECOVERY CHAMBERS
  ↓
SYSTEM RESTORED
```

## 🏆 Round 1 — Kill Line

Round 1 measures **Integrity** rather than rewarding speed as the primary score.

```text
Integrity = Correct Answers / Total Questions × 100
```

Teams are ranked by:

1. **Higher Integrity**
2. **Lower completion time** as the tiebreaker

The first **25 submitted teams** are marked as advancing.

## 🖥️ Interfaces

### Participant — `/`

The participant portal handles authentication, standby, the cinematic breach sequence, Round 1, results, mission control and recovery chambers.

### Organizer — `/admin`

The control room provides:

- Team status overview
- Question editor
- Add / delete / edit questions
- Correct-answer selection
- Round timing configuration
- Breach dispatch
- Phase 1 launch
- Pause / resume / restart
- Top 25 computation
- Live leaderboard and Kill Line

## 🏗️ Architecture

```text
┌─────────────────────┐       ┌─────────────────────┐
│ Participant Browser │       │ Organizer Dashboard │
│        /            │       │       /admin        │
└──────────┬──────────┘       └──────────┬──────────┘
           │                             │
           └──────────────┬──────────────┘
                          ▼
              ┌──────────────────────┐
              │ Firebase Realtime DB │
              ├──────────────────────┤
              │ competition/control  │
              │ rounds/1/config      │
              │ rounds/1/questions   │
              │ teams/{teamCode}     │
              └──────────────────────┘
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the state model and event-control flow.

## 📁 Project Structure

```text
breaking-bug-event/
├── docs/
│   ├── ARCHITECTURE.md
│   └── FIREBASE_SETUP.md
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── error-boundary.tsx
│   │   ├── system-frame.tsx
│   │   └── takeover.tsx
│   ├── data/
│   │   ├── competition.ts
│   │   └── takeover.ts
│   ├── hooks/
│   │   └── useCompetition.ts
│   ├── lib/
│   │   ├── firebase-client.ts
│   │   ├── firebase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── admin.tsx
│   │   ├── not-found.tsx
│   │   └── participant.tsx
│   ├── services/
│   │   └── realtime.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── components.json
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Run locally

### Requirements

- Node.js 18+
- npm
- A Firebase project with Anonymous Authentication and Realtime Database enabled

### Install

```bash
npm install
```

### Configure Firebase

```bash
cp .env.example .env.local
```

Fill the Firebase Web App values in `.env.local`. Never commit `.env.local` or private service-account credentials.

### Start

```bash
npm run dev
```

### Validate

```bash
npm run typecheck
npm run build
```

## 🔥 Firebase

The application can run without Firebase configuration for UI development, but realtime competition behavior requires Firebase.

Detailed setup and recommended production security rules are documented in [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md).

## 🔐 Security

Breaking Bug simulates a breach; it is not a real penetration-testing system. Before an event deployment:

- Restrict organizer writes to authenticated organizer identities.
- Prevent participants from modifying scores, qualification, or control state.
- Isolate team data so one team cannot read another team's answers.
- Validate scoring and qualification server-side where possible.
- Keep secrets out of source control.

## 🗺️ Roadmap

- [x] Participant mission flow
- [x] Organizer control room
- [x] Firebase realtime synchronization
- [x] Shared Round 1 timer
- [x] Pause / resume / restart controls
- [x] Dynamic Round 1 question editor
- [x] Integrity-based Top 25 qualification
- [x] Standalone Vite/npm project structure
- [ ] Hardened Firebase security rules
- [ ] Round 2 challenge engine
- [ ] Round 3 challenge engine
- [ ] Event analytics
- [ ] Deployment runbook

## 👥 Event Operations

The codebase is intentionally structured around event-day reliability: the organizer owns timing and dispatch, while participants consume the shared competition state.

## 📄 License

This repository is maintained for the Breaking Bug competition. Licensing terms can be formalized before public redistribution.

---

**Breaking Bug — Think It. Break It. Fix It.**
