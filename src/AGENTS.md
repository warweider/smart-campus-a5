# AGENTS.md

Instructions for AI coding agents (Bolt.new, Claude, background agents) working on this repository.
Bolt does not load this file automatically. Read it when asked, and do not claim it was loaded otherwise.

## Project
Smart Campus Room Availability Checker. React + TypeScript + Vite, built in Bolt.new.
One fictional room with fictional bookings. A fixed scenario time (now = 540, 09:00) is used.
The app only answers Available / Unavailable for a requested interval.

## Scope (hard constraints)
- One fictional room only. Do not add rooms, catalogs or new features.
- No login, no database (including Bolt Database / Supabase), no backend, no external APIs.
- No real personal data. Booking data stays fictional.
- No secrets: never add API keys, tokens, passwords or .env files with real values.
- No external deployments. Do not press Publish, deploy or change hosting. Only the human publishes.
- Do not add, remove or upgrade dependencies unless the human asks.

## Files
- src/availability.ts: booking rules (evaluate, isStrictOverlap). Single source of truth for AC1-AC5.
- src/App.tsx: UI state and rendering. Must import the rules from src/availability.ts, not copy them.
- src/main.tsx: entry point.
- tests/availability.test.ts: regression suite T01-T12. Do not delete or weaken assertions.
- .bolt/: Bolt project settings. Do not edit.

## Acceptance contract (must be preserved)
- AC1: whole minutes, 0 <= start < end <= 1440; reject start <= now (past or current time).
- AC2: maximum duration 120 minutes (120 allowed, 121 rejected).
- AC3: a blocked room is always Unavailable.
- AC4: overlap with an existing booking is Unavailable; touching endpoints only is allowed.
- AC5: stored fictional booking data is never changed during a check.
- AC6: clear availability feedback; usable layout on desktop and mobile width.

## Safe commands
- npm install
- npm test                                  (vitest run)
- npx vitest run --reporter=verbose
- npx tsc --noEmit -p tsconfig.app.json     (real type check; plain `npx tsc --noEmit` checks no files)
- npm run lint
- npm run build

## Forbidden actions
- Editing files during a read-only review or Plan mode.
- Rewriting or reformatting unrelated code; renaming files; changing UI text, styles or fixture data unless asked.
- Deleting, skipping (.skip / .only) or weakening tests to make them pass.
- Running destructive shell commands (rm -rf, git reset --hard, force push).
- Network calls, deployments, publishing, creating accounts or databases.

## Review gates (before a change is accepted)
1. Propose a minimal patch for ONE named risk and wait for human approval before applying it.
2. After applying: run npm test, the type check, lint and build; paste the real output.
3. Never report a test as passed unless it was executed in this session.
4. Report: changed files, the reason for each change, exact commands, pass/fail counts, remaining risks.
5. The human reviews the diff and approves merge or publish. The agent never does it alone.
