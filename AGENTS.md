# AGENTS.md

Operating instructions for AI coding agents (Bolt.new, Claude, Gemini, background agents) working in this repository.
This file lives at the repository root so that agents which auto-load `AGENTS.md` find it.
Bolt.new and plain chat assistants do NOT load it automatically: the human pastes the relevant sections into the prompt,
and the agent must not claim the file was loaded when it was not.

## 1. Purpose
Smart Campus Room Availability Checker: a one-page React + TypeScript + Vite prototype.
It answers Available / Unavailable for one fictional room (Room B-204) and one requested interval.
A fixed scenario clock is used (now = 540, i.e. 09:00). An optional "Explain availability" panel shows a
deterministic, mocked explanation; it never changes the verdict.

## 2. Architecture
| Path | Role |
|------|------|
| `index.html`, `src/main.tsx` | Entry points (Vite HTML entry, React root). |
| `src/availability.ts` | Pure booking rules: `evaluate`, `isStrictOverlap`, `toHHMM`, constants. Single source of truth for AC1-AC5. |
| `src/App.tsx` | UI state and rendering only. Imports the rules from `@/availability`; never copies them. |
| `src/explain/contract.ts` | Types and validators for the explanation feature (input/output checks, reason codes). |
| `src/explain/mockAdapter.ts` | Mock explanation provider (no network). `?mock=error` / `?mock=timeout` simulate failures. |
| `src/explain/explainService.ts` | Calls the adapter with a 3 s timeout and falls back to a deterministic message. |
| `tests/*.test.ts` | Vitest suites: `availability.test.ts` (T01-T12), `regression.test.ts` (RG01-RG03), `reasonCode.test.ts` (RC), `mitigation_m1.test.ts` (M1), `explain_service.test.ts` (EX01-EX08). |
| `.bolt/` | Bolt.new project settings. Do not edit. |

Data flow: inputs -> `evaluate()` -> `Verdict` -> result panel. The explanation feature reads the verdict, never writes it.

## 3. Setup and safe commands
Node 20+ (verified with Node 22). Install from the lockfile only.
```
npm ci                      # reproducible install from package-lock.json
npm run typecheck           # tsc on tsconfig.app.json (src, tests) AND tsconfig.node.json (vite.config.ts);
                            # plain `npx tsc --noEmit` checks NO files
npm run lint                # eslint .
npm test                    # vitest run
npx vitest run --reporter=verbose
npm run build               # vite build -> dist/
npm run verify              # typecheck + lint + test + build, stops on first failure
npm run dev                 # local dev server only (do not expose publicly)
```
These are the only commands an agent may run without asking. Everything else needs human approval.

## 4. Acceptance criteria (must stay true after every change)
- AC1: whole minutes, 0 <= start < end <= 1440; a start that is not after `now` is rejected.
- AC2: maximum duration 120 minutes (120 allowed, 121 rejected).
- AC3: a blocked room is always Unavailable.
- AC4: overlap with an existing booking is Unavailable; touching endpoints only is allowed.
- AC5: a check never mutates the stored fictional bookings, and the explanation text never changes the verdict.

## 5. Coding conventions
- TypeScript strict mode; no `any`, no `@ts-ignore`.
- Import project modules with the `@/` alias (maps to `src/`).
- Business rules live in `src/availability.ts` as pure functions; React components hold no rule logic.
- Use the exported constants (`DAY_MINUTES`, `MAX_DURATION`) instead of repeating magic numbers.
- Keep user-visible wording stable; tests assert on it (AC6 wording).
- Smallest change that fixes the named problem; no drive-by refactors or reformatting.

## 6. Test expectations
- Every behaviour change ships with a targeted Vitest test that fails before and passes after.
- Never delete, skip (`.skip` / `.only`) or weaken an assertion to make a suite pass.
- Report real output only: command, pass/fail totals, exit code. A test that was not run is reported as "not executed".

## 7. Forbidden actions
- Adding secrets: API keys, tokens, passwords, real `.env` values, or real personal data.
- Production deployment, pressing Publish in Bolt, changing hosting or DNS. Only the human publishes.
- Destructive commands: `rm -rf`, `git reset --hard`, `git push --force`, history rewrites, deleting branches.
- Adding, removing or upgrading dependencies, or running `npm audit fix`, without explicit human approval of the exact change.
- Network calls from the app, new backends, databases (including Bolt Database / Supabase), authentication.
- Scope creep: new rooms, catalogs, pages or features. The `.bolt/prompt` line "fully featured and worthy for production"
  does NOT override this scope.
- Editing files during a read-only review or Plan mode; editing `.bolt/`.

## 8. Review gates
1. Name ONE risk or task, propose a minimal patch (diff) and wait for human approval before applying it.
2. After applying: run `npm run verify` and paste the real output.
3. Report changed files, reason per change, exact commands, pass/fail counts and remaining risks.
4. The human reviews the diff and approves merge or publish. The agent never merges, publishes or deploys alone.
