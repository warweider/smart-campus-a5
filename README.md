# Smart Campus Room Availability Checker

One-page prototype that answers **Available / Unavailable** for a requested time slot in one fictional room.
Built with React 18, TypeScript 5, Vite 5 and Tailwind CSS in Bolt.new. All data is fictional; nothing is booked or stored.

## Rules
Times are whole minutes after midnight (e.g. 660 = 11:00). The scenario clock is fixed at 540 (09:00).
- AC1: 0 <= start < end <= 1440, start must be after now.
- AC2: at most 120 minutes.
- AC3: a blocked room is always Unavailable.
- AC4: overlaps are Unavailable; touching endpoints (start = existing end) are allowed.
- AC5: a check never changes the bookings; the explanation never changes the verdict.

## Run
Requires Node 20+ (tested with Node 22.23).
```
npm ci
npm run dev        # http://localhost:5173
npm run verify     # typecheck + lint + tests + build
```
Individual checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Structure
- `src/availability.ts` - booking rules (pure functions)
- `src/App.tsx` - UI
- `src/explain/` - mocked "Explain availability" feature (no network); add `?mock=error` or `?mock=timeout` to the URL to see the fallback
- `tests/` - Vitest suites

## For AI agents
Read `AGENTS.md` before changing anything.
