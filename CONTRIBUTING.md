# Contributing to Breaking Bug

Thanks for helping improve the competition platform.

## Development rules

- Keep participant timing controlled by organizer state.
- Do not introduce client-side shortcuts that let teams bypass competition controls.
- Keep Firebase reads/writes explicit and easy to audit.
- Prefer small, focused changes.
- Run `npm run typecheck` and `npm run build` before opening a pull request.

## Pull requests

Describe:

1. What changed
2. Why it was necessary
3. How it was tested
4. Any event-day impact or migration requirement

Competition-critical changes should be tested with at least one participant session and one organizer session before event deployment.
