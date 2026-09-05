# Security Policy

Breaking Bug is an event platform containing simulated breach mechanics. It must not be used as a real-world security-testing system.

## Reporting a vulnerability

If you discover a security issue in the competition platform, report it privately to the project maintainer rather than publishing exploit details in a public issue.

## Deployment requirements

Before an event deployment:

- Enable authenticated access for organizer operations.
- Restrict Firebase rules by role and team identity.
- Prevent participant writes to organizer-controlled fields.
- Prevent cross-team reads.
- Keep `.env.local` and service-account credentials out of Git.
- Validate scores and qualification server-side where possible.
- Test reset, pause, resume and restart behavior with multiple clients.
