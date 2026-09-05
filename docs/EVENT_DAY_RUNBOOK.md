# Breaking Bug — Event Day Runbook

## Before participants arrive

1. Confirm Firebase Authentication and Realtime Database are online.
2. Confirm the organizer environment has the required Firebase variables.
3. Open `/admin` in the organizer browser.
4. Verify the Round 1 question count and timers.
5. Confirm the participant devices can reach the competition portal.
6. Keep one spare organizer device ready.

## Participant onboarding

Participants enter their assigned team code and access key at `/`.

After successful authentication, every team remains on **STANDING BY** until the organizer dispatches the breach.

## Round 1 launch sequence

1. **Initiate breach** — starts the synchronized takeover experience.
2. Wait for the hacker transmission to complete.
3. **Begin Phase 1** — starts the shared Round 1 clock.
4. Monitor the Overview / leaderboard during the round.
5. Use **Pause** only when an event-day intervention is required.
6. Use **Resume** to continue from the adjusted shared timestamp.
7. Use **Restart round** only when the entire Round 1 attempt must be restarted.
8. After submissions, select **Compute Top 25**.

## Kill Line

The organizer leaderboard sorts submitted teams by Integrity and then completion time. Ranks 1–25 advance. Rank 26 onward is below the Kill Line.

## Recovery

Advancing teams receive access to Mission Control and the recovery chambers. The current codebase contains the recovery experience while the final Round 2 / Round 3 competition mechanics remain under development.

## Emergency reset

Use **Reset everything** only when the competition state must be cleared. Confirm the reset before continuing.

## Troubleshooting

### Participants are stuck on standby

Check the organizer's Firebase connection and confirm that the correct command was dispatched.

### Round 1 timers differ

Check that the organizer started the round from the control room and that all clients can read `competition/control`.

### Questions are outdated

Open Round 1 in the organizer console, verify the question bank, and use **Save to Firebase** before launching the round.

### Firebase is unavailable

The UI can still render without Firebase configuration, but live competition synchronization requires a working Firebase connection.
