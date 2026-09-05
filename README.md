# Breaking Bug

> **Think fast. Break systems. Fix the impossible.**

Breaking Bug is a browser-based, live cybersecurity and debugging competition platform built for high-pressure, multi-round campus events. Teams enter a controlled mission environment, respond to organizer-triggered events, solve timed challenges, and compete on a live leaderboard.

## 🎯 Competition Concept

Breaking Bug turns a traditional technical competition into an interactive incident-response experience. Participants are taken through a simulated system breach and then dispatched into timed technical challenges.

### Current Competition Flow

1. **Access** — Teams enter the competition portal.
2. **Standby** — Participants wait for organizer authorization.
3. **Anomaly Detection** — The system introduces the incident.
4. **System Breach** — The takeover sequence begins.
5. **Hacker Transmission** — A live mission briefing is delivered.
6. **Round 1: Kill Line** — Teams solve timed debugging questions.
7. **Integrity Ranking** — Accuracy determines the primary score; completion time is used as the tiebreaker.
8. **Top 25 Advance** — The leaderboard applies the Round 1 cutoff automatically.
9. **Round 2 / Round 3** — Extensible competition chambers prepared for future challenges.

## ✨ Platform Features

- Real-time participant and organizer synchronization
- Organizer-controlled mission launch
- Shared Round 1 timer across teams
- Pause, resume and restart controls
- Dynamic Round 1 question management
- Configurable question count and timing
- Randomized answer ordering to reduce predictable answer patterns
- Automatic integrity scoring
- Live leaderboard and Top 25 qualification line
- Firebase Realtime Database integration
- React + TypeScript frontend
- Vite development environment
- Replit-friendly architecture

## 🏗️ Architecture

```text
Participant Browser
       │
       ▼
 React / TypeScript UI
       │
       ├── Competition Hook
       ├── Mission Screens
       └── Round Interfaces
       │
       ▼
 Firebase Realtime Database
       │
       ├── Competition Control
       ├── Team State
       ├── Round Configuration
       ├── Round Questions
       └── Results / Leaderboard
       │
       ▼
 Organizer Dashboard
```

## 📁 Project Structure

```text
src/
├── components/       # Shared competition UI and mission screens
├── data/              # Competition configuration and seed data
├── hooks/             # Competition state and realtime logic
├── lib/               # Firebase and application utilities
├── pages/             # Participant and organizer interfaces
└── services/          # Realtime communication layer
```

## 🚀 Development

The project is designed to run in a Vite-compatible React environment such as Replit.

### Prerequisites

- Node.js 18+
- npm / pnpm
- Firebase project with Realtime Database enabled

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

> The repository currently retains the dependency setup from the original development environment. If your environment uses workspace/catalog dependencies, use the corresponding package-manager configuration provided by that environment.

## 🔐 Firebase Configuration

Firebase client configuration belongs in the application's Firebase client configuration module. Do **not** commit service-account credentials, private keys, or other server-side secrets.

For production deployments, configure Firebase security rules so participants cannot directly modify organizer-controlled state or other teams' records.

## 🧑‍💻 Organizer Dashboard

The organizer interface is responsible for controlling the live competition rather than allowing participants to accelerate or start the mission themselves.

Round 1 controls include:

- Initiate breach
- Begin Phase 1
- Pause
- Resume
- Restart Round 1
- Compute Top 25
- Edit questions
- Add / delete questions
- Configure total duration
- Configure per-question duration

## 🏆 Round 1 Scoring

Round 1 uses an **Integrity** score based on the percentage of correctly solved questions.

```text
Integrity = Correct Answers / Total Questions × 100
```

Teams are ranked by:

1. Higher Integrity
2. Lower completion time as the tiebreaker

The first **25 teams** are marked as advancing to the next round.

## 🛡️ Security Notes

Breaking Bug is an event platform, not a production security-testing system. The simulated breach and hacker experience are presentation mechanics for the competition.

Before a public event deployment:

- Lock down Firebase database rules.
- Keep organizer privileges separate from participant privileges.
- Validate all submissions server-side where possible.
- Never expose private Firebase credentials in the frontend.
- Do not trust client-provided scores or qualification status.

## 🗺️ Roadmap

- [x] Participant mission flow
- [x] Organizer control panel
- [x] Firebase realtime synchronization
- [x] Shared Round 1 timer
- [x] Pause / resume / restart controls
- [x] Dynamic Round 1 question editor
- [x] Integrity-based Top 25 qualification
- [ ] Production-grade Firebase security rules
- [ ] Round 2 challenge engine
- [ ] Round 3 challenge engine
- [ ] Final event analytics
- [ ] Deployment and event-day runbook

## 📜 Event Documentation

Operational documentation, event rules, participant handbook, and deployment notes should live under `docs/` as the competition specification evolves.

## 🤝 Development

Breaking Bug is developed as a live event platform for campus technical competitions. Contributions should keep participant experience, organizer control, realtime consistency, and event-day reliability as first-class priorities.

## 📄 License

This project is currently maintained for the Breaking Bug competition. Licensing and public redistribution terms can be added before open-source release.

---

**Breaking Bug — Think It. Break It. Fix It.**