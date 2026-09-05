# Architecture

## Runtime

Breaking Bug is a single-page React application with two operational surfaces:

- `/` — participant competition channel
- `/admin` — organizer control room

## State model

Firebase Realtime Database is the shared source of truth for event state.

```text
competition/control
rounds/1/config
rounds/1/questions
teams/{teamCode}
```

### Organizer → participants

The organizer writes commands to `competition/control`:

- `breach`
- `phase1-start`
- `phase1-pause`
- `phase1-resume`
- `results`
- `reset`

Participant clients subscribe to the control path and transition their local UI state accordingly.

### Participant → Firebase

A participant can:

- authenticate with a team code and access key
- save selected answers
- submit Round 1 results
- receive the organizer's qualification result

## Round 1 ranking

Integrity is calculated from the team's correct answers:

```text
Integrity = correct / total × 100
```

Ranking uses Integrity descending, followed by completion time ascending as the tiebreaker. The first 25 submitted teams are marked `advanced: true`.

## Design principles

1. Organizer controls event timing.
2. Participants cannot locally accelerate the competition.
3. Shared timestamps keep the Round 1 clock synchronized.
4. Firebase data is treated as event state, not presentation-only state.
5. Client-side scores should be treated as untrusted in a production deployment.
