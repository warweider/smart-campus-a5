# Software Engineering - Assignment #05 - Akshabayev Emil (24B031615)

Repository: Smart Campus Room Availability Checker (React + TypeScript + Vite, Bolt.new export).

- tag `baseline` (commit cf76a64) - source exactly as exported from Bolt.new
- tag `final` (commit 7cf1abc) - reviewed version: root AGENTS.md, README, Task 03 refactoring, mitigations M1 and M2
- `submission/evidence/` - raw command outputs (baseline, after Task 03, M1, M2, final), probe tests, differential test, mutation checks, Gemini prompts/answers, screenshots
- `submission/review/` - M1.diff and M2.diff as reviewed and approved

Run the final version: `git checkout final && npm ci && npm run verify` (Node 20+, tested with Node 22.23.5).
Expected: typecheck, lint and build exit 0; Vitest 55 passed.
