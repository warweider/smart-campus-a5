# Repository context for a READ-ONLY risk review
Project: Smart Campus Room Availability Checker (React 18 + TypeScript + Vite 5, built in Bolt.new). Commit 048665d.

## File tree
```
.bolt/config.json
.bolt/prompt
.gitignore
AGENTS.md
README.md
eslint.config.js
index.html
package-lock.json
package.json
postcss.config.js
src/App.tsx
src/availability.ts
src/explain/contract.ts
src/explain/explainService.ts
src/explain/mockAdapter.ts
src/index.css
src/main.tsx
src/vite-env.d.ts
tailwind.config.js
tests/availability.test.ts
tests/reasonCode.test.ts
tests/regression.test.ts
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

## Baseline check results (actually executed, Node 22.23.5)
- npm ci: OK, npm reported 23 vulnerabilities (2 low, 6 moderate, 13 high, 2 critical); npm audit --omit=dev: 0
- npm run typecheck / lint / build: exit 0
- vitest: 25 passed (3 files) after Task 03

## FILE: AGENTS.md
```md
     1	# AGENTS.md
     2	
     3	Operating instructions for AI coding agents (Bolt.new, Claude, Gemini, background agents) working in this repository.
     4	This file lives at the repository root so that agents which auto-load `AGENTS.md` find it.
     5	Bolt.new and plain chat assistants do NOT load it automatically: the human pastes the relevant sections into the prompt,
     6	and the agent must not claim the file was loaded when it was not.
     7	
     8	## 1. Purpose
     9	Smart Campus Room Availability Checker: a one-page React + TypeScript + Vite prototype.
    10	It answers Available / Unavailable for one fictional room (Room B-204) and one requested interval.
    11	A fixed scenario clock is used (now = 540, i.e. 09:00). An optional "Explain availability" panel shows a
    12	deterministic, mocked explanation; it never changes the verdict.
    13	
    14	## 2. Architecture
    15	| Path | Role |
    16	|------|------|
    17	| `index.html`, `src/main.tsx` | Entry points (Vite HTML entry, React root). |
    18	| `src/availability.ts` | Pure booking rules: `evaluate`, `isStrictOverlap`, `toHHMM`, constants. Single source of truth for AC1-AC5. |
    19	| `src/App.tsx` | UI state and rendering only. Imports the rules from `@/availability`; never copies them. |
    20	| `src/explain/contract.ts` | Types and validators for the explanation feature (input/output checks, reason codes). |
    21	| `src/explain/mockAdapter.ts` | Mock explanation provider (no network). `?mock=error` / `?mock=timeout` simulate failures. |
    22	| `src/explain/explainService.ts` | Calls the adapter with a 3 s timeout and falls back to a deterministic message. |
    23	| `tests/*.test.ts` | Vitest suites. `availability.test.ts` (T01-T12), `regression.test.ts` (RG01-RG03) and any newer suites. |
    24	| `.bolt/` | Bolt.new project settings. Do not edit. |
    25	
    26	Data flow: inputs -> `evaluate()` -> `Verdict` -> result panel. The explanation feature reads the verdict, never writes it.
    27	
    28	## 3. Setup and safe commands
    29	Node 20+ (verified with Node 22). Install from the lockfile only.
    30	```
    31	npm ci                      # reproducible install from package-lock.json
    32	npm run typecheck           # tsc --noEmit -p tsconfig.app.json  (plain `npx tsc --noEmit` checks NO files)
    33	npm run lint                # eslint .
    34	npm test                    # vitest run
    35	npx vitest run --reporter=verbose
    36	npm run build               # vite build -> dist/
    37	npm run verify              # typecheck + lint + test + build, stops on first failure
    38	npm run dev                 # local dev server only (do not expose publicly)
    39	```
    40	These are the only commands an agent may run without asking. Everything else needs human approval.
    41	
    42	## 4. Acceptance criteria (must stay true after every change)
    43	- AC1: whole minutes, 0 <= start < end <= 1440; a start that is not after `now` is rejected.
    44	- AC2: maximum duration 120 minutes (120 allowed, 121 rejected).
    45	- AC3: a blocked room is always Unavailable.
    46	- AC4: overlap with an existing booking is Unavailable; touching endpoints only is allowed.
    47	- AC5: a check never mutates the stored fictional bookings, and the explanation text never changes the verdict.
    48	
    49	## 5. Coding conventions
    50	- TypeScript strict mode; no `any`, no `@ts-ignore`.
    51	- Import project modules with the `@/` alias (maps to `src/`).
    52	- Business rules live in `src/availability.ts` as pure functions; React components hold no rule logic.
    53	- Use the exported constants (`DAY_MINUTES`, `MAX_DURATION`) instead of repeating magic numbers.
    54	- Keep user-visible wording stable; tests assert on it (AC6 wording).
    55	- Smallest change that fixes the named problem; no drive-by refactors or reformatting.
    56	
    57	## 6. Test expectations
    58	- Every behaviour change ships with a targeted Vitest test that fails before and passes after.
    59	- Never delete, skip (`.skip` / `.only`) or weaken an assertion to make a suite pass.
    60	- Report real output only: command, pass/fail totals, exit code. A test that was not run is reported as "not executed".
    61	
    62	## 7. Forbidden actions
    63	- Adding secrets: API keys, tokens, passwords, real `.env` values, or real personal data.
    64	- Production deployment, pressing Publish in Bolt, changing hosting or DNS. Only the human publishes.
    65	- Destructive commands: `rm -rf`, `git reset --hard`, `git push --force`, history rewrites, deleting branches.
    66	- Adding, removing or upgrading dependencies, or running `npm audit fix`, without explicit human approval of the exact change.
    67	- Network calls from the app, new backends, databases (including Bolt Database / Supabase), authentication.
    68	- Scope creep: new rooms, catalogs, pages or features. The `.bolt/prompt` line "fully featured and worthy for production"
    69	  does NOT override this scope.
    70	- Editing files during a read-only review or Plan mode; editing `.bolt/`.
    71	
    72	## 8. Review gates
    73	1. Name ONE risk or task, propose a minimal patch (diff) and wait for human approval before applying it.
    74	2. After applying: run `npm run verify` and paste the real output.
    75	3. Report changed files, reason per change, exact commands, pass/fail counts and remaining risks.
    76	4. The human reviews the diff and approves merge or publish. The agent never merges, publishes or deploys alone.
```

## FILE: README.md
```md
     1	# Smart Campus Room Availability Checker
     2	
     3	One-page prototype that answers **Available / Unavailable** for a requested time slot in one fictional room.
     4	Built with React 18, TypeScript 5, Vite 5 and Tailwind CSS in Bolt.new. All data is fictional; nothing is booked or stored.
     5	
     6	## Rules
     7	Times are whole minutes after midnight (e.g. 660 = 11:00). The scenario clock is fixed at 540 (09:00).
     8	- AC1: 0 <= start < end <= 1440, start must be after now.
     9	- AC2: at most 120 minutes.
    10	- AC3: a blocked room is always Unavailable.
    11	- AC4: overlaps are Unavailable; touching endpoints (start = existing end) are allowed.
    12	- AC5: a check never changes the bookings; the explanation never changes the verdict.
    13	
    14	## Run
    15	Requires Node 20+ (tested with Node 22.23).
    16	```
    17	npm ci
    18	npm run dev        # http://localhost:5173
    19	npm run verify     # typecheck + lint + tests + build
    20	```
    21	Individual checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
    22	
    23	## Structure
    24	- `src/availability.ts` - booking rules (pure functions)
    25	- `src/App.tsx` - UI
    26	- `src/explain/` - mocked "Explain availability" feature (no network); add `?mock=error` or `?mock=timeout` to the URL to see the fallback
    27	- `tests/` - Vitest suites
    28	
    29	## For AI agents
    30	Read `AGENTS.md` before changing anything.
```

## FILE: package.json
```json
     1	{
     2	  "name": "vite-react-typescript-starter",
     3	  "private": true,
     4	  "version": "0.0.0",
     5	  "type": "module",
     6	  "scripts": {
     7	    "dev": "vite",
     8	    "build": "vite build",
     9	    "lint": "eslint .",
    10	    "preview": "vite preview",
    11	    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    12	    "test": "vitest run",
    13	    "verify": "npm run typecheck && npm run lint && npm test && npm run build"
    14	  },
    15	  "dependencies": {
    16	    "lucide-react": "^0.446.0",
    17	    "react": "^18.3.1",
    18	    "react-dom": "^18.3.1"
    19	  },
    20	  "devDependencies": {
    21	    "@eslint/js": "^9.9.1",
    22	    "@types/react": "^18.3.5",
    23	    "@types/react-dom": "^18.3.0",
    24	    "@vitejs/plugin-react": "^4.3.1",
    25	    "autoprefixer": "^10.4.18",
    26	    "eslint": "^9.9.1",
    27	    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    28	    "eslint-plugin-react-refresh": "^0.4.11",
    29	    "globals": "^15.9.0",
    30	    "postcss": "^8.4.35",
    31	    "tailwindcss": "^3.4.1",
    32	    "typescript": "^5.5.3",
    33	    "typescript-eslint": "^8.3.0",
    34	    "vite": "^5.4.2",
    35	    "vitest": "^1.6.0"
    36	  }
    37	}```

## FILE: .gitignore
```gitignore
     1	logs
     2	*.log
     3	npm-debug.log*
     4	yarn-debug.log*
     5	yarn-error.log*
     6	pnpm-debug.log*
     7	lerna-debug.log*
     8	
     9	node_modules
    10	dist
    11	dist-ssr
    12	*.local
    13	
    14	.vscode/*
    15	!.vscode/extensions.json
    16	.idea
    17	.DS_Store
    18	*.suo
    19	*.ntvs*
    20	*.njsproj
    21	*.sln
    22	*.sw?
    23	.env
```

## FILE: .bolt/prompt
```bolt/prompt
     1	For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.
     2	
     3	By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.
     4	
     5	Use icons from lucide-react for logos.
     6	
     7	Import project modules with the `@/` path alias, which maps to `src/` (e.g. `@/components/Foo` == `src/components/Foo`), instead of deep relative paths like `../../components/Foo`.
```

## FILE: tsconfig.json
```json
     1	{
     2	  "files": [],
     3	  "references": [
     4	    { "path": "./tsconfig.app.json" },
     5	    { "path": "./tsconfig.node.json" }
     6	  ]
     7	}
```

## FILE: tsconfig.app.json
```json
     1	{
     2	  "compilerOptions": {
     3	    "target": "ES2020",
     4	    "useDefineForClassFields": true,
     5	    "lib": ["ES2020", "DOM", "DOM.Iterable"],
     6	    "module": "ESNext",
     7	    "skipLibCheck": true,
     8	
     9	    /* Bundler mode */
    10	    "moduleResolution": "bundler",
    11	    "allowImportingTsExtensions": true,
    12	    "isolatedModules": true,
    13	    "moduleDetection": "force",
    14	    "noEmit": true,
    15	    "jsx": "react-jsx",
    16	
    17	    /* Path alias — depth-invariant imports for src (@/foo === src/foo from any file) */
    18	    "baseUrl": ".",
    19	    "paths": {
    20	      "@/*": ["src/*"]
    21	    },
    22	
    23	    /* Linting */
    24	    "strict": true,
    25	    "noUnusedLocals": false,
    26	    "noUnusedParameters": false,
    27	    "noFallthroughCasesInSwitch": true
    28	  },
    29	  "include": ["src", "tests"]
    30	}```

## FILE: vite.config.ts
```ts
     1	import { defineConfig } from 'vite';
     2	import react from '@vitejs/plugin-react';
     3	import { fileURLToPath, URL } from 'node:url';
     4	
     5	// https://vitejs.dev/config/
     6	export default defineConfig({
     7	  plugins: [react()],
     8	  resolve: {
     9	    alias: {
    10	      '@': fileURLToPath(new URL('./src', import.meta.url)),
    11	    },
    12	  },
    13	  optimizeDeps: {
    14	    exclude: ['lucide-react'],
    15	  },
    16	});
```

## FILE: eslint.config.js
```js
     1	import js from '@eslint/js';
     2	import globals from 'globals';
     3	import reactHooks from 'eslint-plugin-react-hooks';
     4	import reactRefresh from 'eslint-plugin-react-refresh';
     5	import tseslint from 'typescript-eslint';
     6	
     7	export default tseslint.config(
     8	  { ignores: ['dist'] },
     9	  {
    10	    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    11	    files: ['**/*.{ts,tsx}'],
    12	    languageOptions: {
    13	      ecmaVersion: 2020,
    14	      globals: globals.browser,
    15	    },
    16	    plugins: {
    17	      'react-hooks': reactHooks,
    18	      'react-refresh': reactRefresh,
    19	    },
    20	    rules: {
    21	      ...reactHooks.configs.recommended.rules,
    22	      'react-refresh/only-export-components': [
    23	        'warn',
    24	        { allowConstantExport: true },
    25	      ],
    26	    },
    27	  }
    28	);
```

## FILE: index.html
```html
     1	<!doctype html>
     2	<html lang="en">
     3	  <head>
     4	    <meta charset="UTF-8" />
     5	    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
     6	    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     7	    <title>Smart Campus Room Availability Checker</title>
     8	    <meta property="og:image" content="https://bolt.new/static/og_default.png" />
     9	    <meta name="twitter:card" content="summary_large_image" />
    10	    <meta name="twitter:image" content="https://bolt.new/static/og_default.png" />
    11	  </head>
    12	  <body>
    13	    <div id="root"></div>
    14	    <script type="module" src="/src/main.tsx"></script>
    15	  </body>
    16	</html>
```

## FILE: src/main.tsx
```tsx
     1	import { StrictMode } from 'react';
     2	import { createRoot } from 'react-dom/client';
     3	import App from './App.tsx';
     4	import './index.css';
     5	
     6	createRoot(document.getElementById('root')!).render(
     7	  <StrictMode>
     8	    <App />
     9	  </StrictMode>
    10	);
```

## FILE: src/availability.ts
```ts
     1	// Smart Campus room availability: pure logic extracted from src/App.tsx (evaluate / isStrictOverlap).
     2	export interface Booking {
     3	  start: number; // minutes after midnight
     4	  end: number;
     5	}
     6	
     7	// Stable machine-readable reason for every verdict (Task 03: replaces parsing of message text).
     8	export const REASON_CODES = [
     9	  'AVAILABLE',
    10	  'OVERLAP',
    11	  'BLOCKED',
    12	  'INVALID_TIME',
    13	  'PAST_TIME',
    14	  'TOO_LONG',
    15	] as const;
    16	
    17	export type ReasonCode = (typeof REASON_CODES)[number];
    18	
    19	export type Verdict =
    20	  | { kind: 'available'; code: 'AVAILABLE' }
    21	  | { kind: 'unavailable'; code: 'OVERLAP' | 'BLOCKED'; reason: string }
    22	  | { kind: 'error'; code: 'INVALID_TIME' | 'PAST_TIME' | 'TOO_LONG'; reason: string };
    23	
    24	export const DAY_MINUTES = 1440;
    25	export const MAX_DURATION = 120;
    26	
    27	export function toHHMM(min: number): string {
    28	  const h = Math.floor(min / 60);
    29	  const m = min % 60;
    30	  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    31	}
    32	
    33	export function isStrictOverlap(a: Booking, b: Booking): boolean {
    34	  // Intervals that only touch at an endpoint do NOT overlap (AC4).
    35	  return a.start < b.end && b.start < a.end;
    36	}
    37	
    38	export function evaluate(
    39	  startRaw: string,
    40	  endRaw: string,
    41	  now: number,
    42	  blocked: boolean,
    43	  bookings: Booking[],
    44	): Verdict {
    45	  const startTrim = startRaw.trim();
    46	  const endTrim = endRaw.trim();
    47	  if (startTrim === '' || endTrim === '') {
    48	    return { kind: 'error', code: 'INVALID_TIME', reason: 'Please enter both a start and an end time.' };
    49	  }
    50	  // AC3: a blocked room is always Unavailable (Bolt Version 2).
    51	  if (blocked) {
    52	    return { kind: 'unavailable', code: 'BLOCKED', reason: 'This room is currently blocked for bookings.' };
    53	  }
    54	  if (!/^-?\d+$/.test(startTrim) || !/^-?\d+$/.test(endTrim)) {
    55	    return { kind: 'error', code: 'INVALID_TIME', reason: 'Start and end must be whole numbers (minutes after midnight).' };
    56	  }
    57	  const start = Number(startTrim);
    58	  const end = Number(endTrim);
    59	  if (start < 0 || end < 0 || start > DAY_MINUTES || end > DAY_MINUTES) {
    60	    return { kind: 'error', code: 'INVALID_TIME', reason: `Times must be between 0 and ${DAY_MINUTES} (00:00 and 24:00).` };
    61	  }
    62	  if (start >= end) {
    63	    return { kind: 'error', code: 'INVALID_TIME', reason: 'Start must be earlier than end.' };
    64	  }
    65	  if (!(start > now)) {
    66	    return { kind: 'error', code: 'PAST_TIME', reason: `Start must be after the current time (${toHHMM(now)} / ${now}).` };
    67	  }
    68	  const duration = end - start;
    69	  if (duration > MAX_DURATION) {
    70	    return { kind: 'error', code: 'TOO_LONG', reason: `Booking duration is ${duration} minutes. Maximum allowed is ${MAX_DURATION} minutes.` };
    71	  }
    72	  const requested = { start, end };
    73	  // Sort by start so the scan visits bookings in time order.
    74	  const conflict = [...bookings].sort((a, b) => a.start - b.start).find((b) => isStrictOverlap(requested, b));
    75	  if (conflict) {
    76	    return { kind: 'unavailable', code: 'OVERLAP', reason: `Overlaps an existing booking (${toHHMM(conflict.start)}–${toHHMM(conflict.end)}).` };
    77	  }
    78	  return { kind: 'available', code: 'AVAILABLE' };
    79	}```

## FILE: src/explain/contract.ts
```ts
     1	import type { Verdict, ReasonCode } from '@/availability';
     2	import { toHHMM, REASON_CODES } from '@/availability';
     3	
     4	export { REASON_CODES };
     5	export type { ReasonCode };
     6	
     7	export type ExplainInput = {
     8	  roomLabel: string;
     9	  start: number;
    10	  end: number;
    11	  isAvailable: boolean;
    12	  reasonCode: ReasonCode;
    13	};
    14	
    15	export type ExplainOutput = { explanation: string };
    16	
    17	// The reason code now comes from the checker itself (Task 03). Before, it was
    18	// guessed from the message text, so a wording change silently mislabelled verdicts.
    19	export function deriveReasonCode(verdict: Verdict): ReasonCode {
    20	  return verdict.code;
    21	}
    22	
    23	// Validates untrusted input; returns null when the shape is wrong.
    24	export function validateExplainInput(raw: unknown): ExplainInput | null {
    25	  if (typeof raw !== 'object' || raw === null) return null;
    26	  const r = raw as Record<string, unknown>;
    27	  if (typeof r.roomLabel !== 'string') return null;
    28	  const roomLabel = r.roomLabel.trim();
    29	  if (roomLabel === '' || roomLabel.length > 100) return null;
    30	  if (!Number.isInteger(r.start) || !Number.isInteger(r.end)) return null;
    31	  const start = r.start as number;
    32	  const end = r.end as number;
    33	  if (start < 0 || end < 0 || start > 1440 || end > 1440) return null;
    34	  if (typeof r.isAvailable !== 'boolean') return null;
    35	  if (typeof r.reasonCode !== 'string') return null;
    36	  if (!REASON_CODES.includes(r.reasonCode as ReasonCode)) return null;
    37	  return {
    38	    roomLabel,
    39	    start,
    40	    end,
    41	    isAvailable: r.isAvailable,
    42	    reasonCode: r.reasonCode as ReasonCode,
    43	  };
    44	}
    45	
    46	function hasControlChars(text: string): boolean {
    47	  for (let i = 0; i < text.length; i++) {
    48	    const code = text.charCodeAt(i);
    49	    if (code < 0x20 || code === 0x7f) return true;
    50	  }
    51	  return false;
    52	}
    53	
    54	// Validates untrusted adapter output: plain text, 1..300 chars,
    55	// no HTML brackets and no control characters.
    56	export function validateExplanation(raw: unknown): string | null {
    57	  if (typeof raw !== 'string') return null;
    58	  const text = raw.trim();
    59	  if (text === '' || text.length > 300) return null;
    60	  if (/[<>]/.test(text) || hasControlChars(text)) return null;
    61	  return text;
    62	}
    63	
    64	export function describeSlot(input: ExplainInput): string {
    65	  return `${input.roomLabel} ${toHHMM(input.start)}–${toHHMM(input.end)}`;
    66	}
    67	
    68	export const MAX_EXPLANATION_LENGTH = 300;
```

## FILE: src/explain/mockAdapter.ts
```ts
     1	import { MAX_DURATION } from '@/availability';
     2	import {
     3	  validateExplainInput,
     4	  validateExplanation,
     5	  describeSlot,
     6	  type ExplainInput,
     7	  type ExplainOutput,
     8	} from './contract';
     9	
    10	export type MockMode = 'ok' | 'error' | 'timeout';
    11	
    12	export function getMockMode(
    13	  search: string = typeof window !== 'undefined' ? window.location.search : '',
    14	): MockMode {
    15	  const value = new URLSearchParams(search).get('mock');
    16	  return value === 'error' || value === 'timeout' ? value : 'ok';
    17	}
    18	
    19	function delay(ms: number): Promise<void> {
    20	  return new Promise((resolve) => setTimeout(resolve, ms));
    21	}
    22	
    23	// Built only from the structured input — never from free text.
    24	function composeExplanation(input: ExplainInput): string {
    25	  const slot = describeSlot(input);
    26	  switch (input.reasonCode) {
    27	    case 'AVAILABLE':
    28	      return `${slot} is available. The request starts after the current time, stays within the day, is at most ${MAX_DURATION} minutes long, and does not overlap any existing booking.`;
    29	    case 'OVERLAP':
    30	      return `${slot} is unavailable because the requested slot overlaps an existing booking. Touching endpoints would be allowed, but this request crosses one.`;
    31	    case 'BLOCKED':
    32	      return `${slot} is unavailable because the room is currently blocked; every request is declined while the block is active.`;
    33	    case 'PAST_TIME':
    34	      return `${slot} was rejected because the start time is not after the current time.`;
    35	    case 'TOO_LONG':
    36	      return `${slot} was rejected because it is longer than the maximum allowed duration of ${MAX_DURATION} minutes.`;
    37	    case 'INVALID_TIME':
    38	      return `${slot} could not be checked because the times are invalid. Enter whole minutes with 0 <= start < end <= 1440.`;
    39	  }
    40	}
    41	
    42	export async function mockExplainAdapter(raw: unknown): Promise<ExplainOutput> {
    43	  const input = validateExplainInput(raw);
    44	  if (!input) throw new Error('mock adapter: invalid input');
    45	
    46	  const mode = getMockMode();
    47	  if (mode === 'error') {
    48	    await delay(300);
    49	    throw new Error('mock adapter: simulated failure');
    50	  }
    51	  await delay(mode === 'timeout' ? 5000 : 600);
    52	
    53	  const explanation = validateExplanation(composeExplanation(input));
    54	  if (!explanation) throw new Error('mock adapter: invalid output');
    55	  return { explanation };
    56	}
```

## FILE: src/explain/explainService.ts
```ts
     1	import {
     2	  validateExplanation,
     3	  describeSlot,
     4	  MAX_EXPLANATION_LENGTH,
     5	  type ExplainInput,
     6	  type ExplainOutput,
     7	} from './contract';
     8	import { mockExplainAdapter } from './mockAdapter';
     9	
    10	const TIMEOUT_MS = 3000;
    11	
    12	export type ExplainResult = {
    13	  output: ExplainOutput;
    14	  usedFallback: boolean;
    15	};
    16	
    17	// Deterministic fallback, built only from the structured input.
    18	function fallbackExplanation(input: ExplainInput): string {
    19	  const slot = describeSlot(input);
    20	  switch (input.reasonCode) {
    21	    case 'AVAILABLE':
    22	      return `Fallback: ${slot} is available under all booking rules.`;
    23	    case 'OVERLAP':
    24	      return `Fallback: ${slot} is unavailable because it overlaps an existing booking.`;
    25	    case 'BLOCKED':
    26	      return `Fallback: ${slot} is unavailable because the room is blocked.`;
    27	    case 'PAST_TIME':
    28	      return `Fallback: the start time for ${slot} is not after the current time.`;
    29	    case 'TOO_LONG':
    30	      return `Fallback: the requested booking at ${slot} exceeds the maximum duration.`;
    31	    case 'INVALID_TIME':
    32	      return `Fallback: the times for ${slot} are invalid and were not checked.`;
    33	  }
    34	}
    35	
    36	export async function getExplanation(input: ExplainInput): Promise<ExplainResult> {
    37	  try {
    38	    const result = await Promise.race([
    39	      mockExplainAdapter(input),
    40	      new Promise<never>((_, reject) =>
    41	        setTimeout(() => reject(new Error('explanation timed out')), TIMEOUT_MS),
    42	      ),
    43	    ]);
    44	    const explanation = validateExplanation(result.explanation);
    45	    if (!explanation || explanation.length > MAX_EXPLANATION_LENGTH) {
    46	      throw new Error('explanation service returned invalid output');
    47	    }
    48	    return { output: { explanation }, usedFallback: false };
    49	  } catch {
    50	    return { output: { explanation: fallbackExplanation(input) }, usedFallback: true };
    51	  }
    52	}
```

## FILE: src/App.tsx
```tsx
     1	import { useMemo, useState } from 'react';
     2	import {
     3	  DoorOpen,
     4	  Clock,
     5	  ShieldAlert,
     6	  CheckCircle2,
     7	  XCircle,
     8	  CalendarCheck,
     9	  Building2,
    10	  Info,
    11	  Sparkles,
    12	} from 'lucide-react';
    13	import { evaluate, toHHMM, DAY_MINUTES, MAX_DURATION, type Booking, type Verdict } from '@/availability';
    14	import { deriveReasonCode, type ExplainInput } from './explain/contract';
    15	import { getExplanation, type ExplainResult } from './explain/explainService';
    16	
    17	const QUESTION_MAX = 200;
    18	
    19	const ROOM_NAME = 'Room B-204';
    20	const DEFAULT_NOW = 540; // 09:00
    21	const DEFAULT_BOOKINGS = [{ start: 600, end: 660 }]; // 10:00 - 11:00
    22	
    23	function App() {
    24	  const [now] = useState(DEFAULT_NOW);
    25	  const [blocked, setBlocked] = useState(false);
    26	  const [bookings] = useState<Booking[]>(DEFAULT_BOOKINGS);
    27	
    28	  const [startInput, setStartInput] = useState('');
    29	  const [endInput, setEndInput] = useState('');
    30	  const [verdict, setVerdict] = useState<Verdict | null>(null);
    31	
    32	  const [question, setQuestion] = useState('');
    33	  const [explainState, setExplainState] = useState<
    34	    { status: 'idle' } | { status: 'loading' } | { status: 'done'; result: ExplainResult }
    35	  >({ status: 'idle' });
    36	  const [explainInput, setExplainInput] = useState<ExplainInput | null>(null);
    37	
    38	  const parsedPreview = useMemo(() => {
    39	    const s = Number(startInput);
    40	    const e = Number(endInput);
    41	    if (
    42	      /^\d+$/.test(startInput.trim()) &&
    43	      /^\d+$/.test(endInput.trim()) &&
    44	      s < e
    45	    ) {
    46	      return { start: s, end: e, valid: true };
    47	    }
    48	    return { valid: false } as const;
    49	  }, [startInput, endInput]);
    50	
    51	  const handleCheck = () => {
    52	    setVerdict(evaluate(startInput, endInput, now, blocked, bookings));
    53	    setExplainState({ status: 'idle' });
    54	    setExplainInput(null);
    55	  };
    56	
    57	  const handleReset = () => {
    58	    setStartInput('');
    59	    setEndInput('');
    60	    setVerdict(null);
    61	    setQuestion('');
    62	    setExplainState({ status: 'idle' });
    63	    setExplainInput(null);
    64	  };
    65	
    66	  const handleExplain = () => {
    67	    if (!verdict) return;
    68	    const start = Number(startInput.trim());
    69	    const end = Number(endInput.trim());
    70	    const input: ExplainInput = {
    71	      roomLabel: ROOM_NAME,
    72	      start: Number.isInteger(start) && start >= 0 ? start : 0,
    73	      end: Number.isInteger(end) && end <= 1440 ? end : 1440,
    74	      isAvailable: verdict.kind === 'available',
    75	      reasonCode: deriveReasonCode(verdict),
    76	    };
    77	    setExplainInput(input);
    78	    setExplainState({ status: 'loading' });
    79	    getExplanation(input).then((result) => {
    80	      setExplainState({ status: 'done', result });
    81	    });
    82	  };
    83	
    84	  return (
    85	    <div className="min-h-screen bg-slate-100 text-slate-900">
    86	      {/* Top bar */}
    87	      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
    88	        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center gap-3">
    89	          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
    90	            <Building2 className="h-5 w-5" />
    91	          </div>
    92	          <div className="leading-tight">
    93	            <p className="text-sm font-medium text-slate-500">Northgate University</p>
    94	            <h1 className="text-lg font-semibold tracking-tight">Smart Campus Room Checker</h1>
    95	          </div>
    96	        </div>
    97	      </header>
    98	
    99	      <main className="mx-auto max-w-5xl px-5 py-8 grid gap-6 lg:grid-cols-5">
   100	        {/* Left: Room status + timeline */}
   101	        <section className="lg:col-span-3 space-y-6">
   102	          {/* Room card */}
   103	          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
   104	            <div className="flex flex-wrap items-start justify-between gap-4">
   105	              <div className="flex items-center gap-3">
   106	                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
   107	                  <DoorOpen className="h-6 w-6" />
   108	                </div>
   109	                <div>
   110	                  <p className="text-xs uppercase tracking-wider text-slate-400">Selected room</p>
   111	                  <h2 className="text-xl font-semibold">{ROOM_NAME}</h2>
   112	                </div>
   113	              </div>
   114	              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
   115	                <Clock className="h-4 w-4 text-slate-400" />
   116	                <span className="text-sm font-medium">Now: {toHHMM(now)}</span>
   117	                <span className="text-xs text-slate-400">({now} min)</span>
   118	              </div>
   119	            </div>
   120	
   121	            {/* Blocked toggle */}
   122	            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4">
   123	              <div className="flex items-center gap-3">
   124	                <ShieldAlert
   125	                  className={`h-5 w-5 ${blocked ? 'text-rose-500' : 'text-slate-300'}`}
   126	                />
   127	                <div>
   128	                  <p className="text-sm font-medium">Room status</p>
   129	                  <p className="text-xs text-slate-500">
   130	                    {blocked ? 'Blocked — all requests are unavailable.' : 'Open for booking requests.'}
   131	                  </p>
   132	                </div>
   133	              </div>
   134	              <button
   135	                type="button"
   136	                role="switch"
   137	                aria-checked={blocked}
   138	                onClick={() => {
   139	                  setBlocked((b) => !b);
   140	                  setVerdict(null);
   141	                }}
   142	                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
   143	                  blocked ? 'bg-rose-500' : 'bg-emerald-500'
   144	                }`}
   145	              >
   146	                <span
   147	                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
   148	                    blocked ? 'translate-x-5' : 'translate-x-0.5'
   149	                  }`}
   150	                />
   151	              </button>
   152	            </div>
   153	          </div>
   154	
   155	          {/* Timeline */}
   156	          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
   157	            <div className="flex items-center justify-between">
   158	              <h3 className="text-sm font-semibold text-slate-700">Today's schedule</h3>
   159	              <span className="text-xs text-slate-400">00:00 → 24:00</span>
   160	            </div>
   161	
   162	            <Timeline
   163	              now={now}
   164	              bookings={bookings}
   165	              proposed={parsedPreview.valid ? parsedPreview : null}
   166	            />
   167	
   168	            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
   169	              <LegendDot className="bg-amber-400" label="Current time" />
   170	              <LegendDot className="bg-teal-500" label="Existing booking" />
   171	              <LegendDot className="bg-sky-500" label="Your request" />
   172	            </div>
   173	          </div>
   174	
   175	          {/* Existing bookings list */}
   176	          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
   177	            <h3 className="text-sm font-semibold text-slate-700">Existing bookings</h3>
   178	            <ul className="mt-3 space-y-2">
   179	              {bookings.map((b, i) => (
   180	                <li
   181	                  key={i}
   182	                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
   183	                >
   184	                  <div className="flex items-center gap-3">
   185	                    <CalendarCheck className="h-4 w-4 text-teal-600" />
   186	                    <span className="text-sm font-medium">
   187	                      {toHHMM(b.start)} – {toHHMM(b.end)}
   188	                    </span>
   189	                  </div>
   190	                  <span className="text-xs text-slate-400">{b.end - b.start} min</span>
   191	                </li>
   192	              ))}
   193	            </ul>
   194	            <p className="mt-3 flex items-start gap-2 text-xs text-slate-400">
   195	              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
   196	              Intervals that only touch at an endpoint (e.g. 11:00 start when a booking ends at 11:00) do not overlap.
   197	            </p>
   198	          </div>
   199	        </section>
   200	
   201	        {/* Right: Checker form */}
   202	        <section className="lg:col-span-2">
   203	          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24">
   204	            <h3 className="text-base font-semibold">Check availability</h3>
   205	            <p className="mt-1 text-sm text-slate-500">
   206	              Enter times as minutes after midnight. Max {MAX_DURATION} minutes.
   207	            </p>
   208	
   209	            <div className="mt-5 space-y-4">
   210	              <Field
   211	                label="Start (min)"
   212	                hint={startInput && /^\d+$/.test(startInput.trim()) ? toHHMM(Number(startInput)) : undefined}
   213	              >
   214	                <input
   215	                  type="text"
   216	                  inputMode="numeric"
   217	                  value={startInput}
   218	                  onChange={(e) => {
   219	                    setStartInput(e.target.value);
   220	                    setVerdict(null);
   221	                  }}
   222	                  placeholder="e.g. 660"
   223	                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
   224	                />
   225	              </Field>
   226	              <Field
   227	                label="End (min)"
   228	                hint={endInput && /^\d+$/.test(endInput.trim()) ? toHHMM(Number(endInput)) : undefined}
   229	              >
   230	                <input
   231	                  type="text"
   232	                  inputMode="numeric"
   233	                  value={endInput}
   234	                  onChange={(e) => {
   235	                    setEndInput(e.target.value);
   236	                    setVerdict(null);
   237	                  }}
   238	                  placeholder="e.g. 720"
   239	                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
   240	                />
   241	              </Field>
   242	            </div>
   243	
   244	            <div className="mt-5 flex gap-3">
   245	              <button
   246	                type="button"
   247	                onClick={handleCheck}
   248	                className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
   249	              >
   250	                Check availability
   251	              </button>
   252	              <button
   253	                type="button"
   254	                onClick={handleReset}
   255	                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
   256	              >
   257	                Reset
   258	              </button>
   259	            </div>
   260	
   261	            {verdict && <ResultPanel verdict={verdict} />}
   262	
   263	            {verdict && (
   264	              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
   265	                <Field label="Question (optional, max 200 characters)">
   266	                  <textarea
   267	                    value={question}
   268	                    maxLength={QUESTION_MAX}
   269	                    rows={2}
   270	                    onChange={(e) => {
   271	                      const raw = e.target.value;
   272	                      let next = '';
   273	                      for (let i = 0; i < raw.length; i++) {
   274	                        const code = raw.charCodeAt(i);
   275	                        if (code >= 0x20 && code !== 0x7f) next += raw[i];
   276	                      }
   277	                      setQuestion(next);
   278	                    }}
   279	                    placeholder="e.g. Why is this slot unavailable?"
   280	                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
   281	                  />
   282	                </Field>
   283	                <button
   284	                  type="button"
   285	                  onClick={handleExplain}
   286	                  disabled={explainState.status === 'loading'}
   287	                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
   288	                >
   289	                  <Sparkles className="h-4 w-4" />
   290	                  {explainState.status === 'loading' ? 'Explaining…' : 'Explain availability'}
   291	                </button>
   292	
   293	                {explainState.status === 'done' && explainInput && (
   294	                  <div className="mt-4 rounded-lg bg-violet-50 p-3 ring-1 ring-violet-200" role="note">
   295	                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-violet-700">
   296	                      <Sparkles className="h-3.5 w-3.5" />
   297	                      AI-generated explanation (may be imperfect)
   298	                    </p>
   299	                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
   300	                      {explainState.result.output.explanation}
   301	                    </p>
   302	                    {explainState.result.usedFallback && (
   303	                      <p className="mt-1 text-xs text-slate-500">
   304	                        The explanation service could not be reached; this is a standard fallback message.
   305	                      </p>
   306	                    )}
   307	                    <p className="mt-2 text-xs text-slate-400">
   308	                      The confirmed status above is authoritative and never changes based on this text.
   309	                    </p>
   310	                  </div>
   311	                )}
   312	              </div>
   313	            )}
   314	          </div>
   315	        </section>
   316	      </main>
   317	
   318	      <footer className="mx-auto max-w-5xl px-5 pb-10 text-center text-xs text-slate-400">
   319	        Prototype only — checks availability, does not create bookings. All data is fictional.
   320	      </footer>
   321	    </div>
   322	  );
   323	}
   324	
   325	function Field({
   326	  label,
   327	  hint,
   328	  children,
   329	}: {
   330	  label: string;
   331	  hint?: string;
   332	  children: React.ReactNode;
   333	}) {
   334	  return (
   335	    <label className="block">
   336	      <div className="mb-1.5 flex items-center justify-between">
   337	        <span className="text-sm font-medium text-slate-700">{label}</span>
   338	        {hint && <span className="text-xs text-slate-400">{hint}</span>}
   339	      </div>
   340	      {children}
   341	    </label>
   342	  );
   343	}
   344	
   345	function LegendDot({ className, label }: { className: string; label: string }) {
   346	  return (
   347	    <span className="flex items-center gap-1.5">
   348	      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${className}`} />
   349	      {label}
   350	    </span>
   351	  );
   352	}
   353	
   354	function Timeline({
   355	  now,
   356	  bookings,
   357	  proposed,
   358	}: {
   359	  now: number;
   360	  bookings: Booking[];
   361	  proposed: { start: number; end: number } | null;
   362	}) {
   363	  const ticks = [0, 360, 720, 1080, 1440];
   364	  return (
   365	    <div className="mt-4">
   366	      <div className="relative h-10 w-full rounded-md bg-slate-100 overflow-hidden">
   367	        {/* existing bookings */}
   368	        {bookings.map((b, i) => (
   369	          <div
   370	            key={`b-${i}`}
   371	            className="absolute top-0 h-full bg-teal-500/80"
   372	            style={{
   373	              left: `${(b.start / DAY_MINUTES) * 100}%`,
   374	              width: `${((b.end - b.start) / DAY_MINUTES) * 100}%`,
   375	            }}
   376	            title={`${toHHMM(b.start)}–${toHHMM(b.end)}`}
   377	          />
   378	        ))}
   379	        {/* proposed */}
   380	        {proposed && (
   381	          <div
   382	            className="absolute top-0 h-full bg-sky-500/70 border border-sky-700"
   383	            style={{
   384	              left: `${(proposed.start / DAY_MINUTES) * 100}%`,
   385	              width: `${((proposed.end - proposed.start) / DAY_MINUTES) * 100}%`,
   386	            }}
   387	            title={`Request ${toHHMM(proposed.start)}–${toHHMM(proposed.end)}`}
   388	          />
   389	        )}
   390	        {/* now marker */}
   391	        <div
   392	          className="absolute top-0 h-full w-0.5 bg-amber-400"
   393	          style={{ left: `${(now / DAY_MINUTES) * 100}%` }}
   394	        />
   395	      </div>
   396	      <div className="relative mt-1 h-4 text-[10px] text-slate-400">
   397	        {ticks.map((t) => (
   398	          <span
   399	            key={t}
   400	            className="absolute -translate-x-1/2"
   401	            style={{ left: `${(t / DAY_MINUTES) * 100}%` }}
   402	          >
   403	            {toHHMM(t)}
   404	          </span>
   405	        ))}
   406	      </div>
   407	    </div>
   408	  );
   409	}
   410	
   411	function ResultPanel({ verdict }: { verdict: Verdict }) {
   412	  if (verdict.kind === 'available') {
   413	    return (
   414	      <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
   415	        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
   416	        <div>
   417	          <p className="font-semibold text-emerald-800">Available</p>
   418	          <p className="text-sm text-emerald-700">
   419	            This time slot is free and meets all availability rules.
   420	          </p>
   421	        </div>
   422	      </div>
   423	    );
   424	  }
   425	  if (verdict.kind === 'unavailable') {
   426	    return (
   427	      <div className="mt-5 flex items-start gap-3 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
   428	        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
   429	        <div>
   430	          <p className="font-semibold text-rose-800">Unavailable</p>
   431	          <p className="text-sm text-rose-700">{verdict.reason}</p>
   432	        </div>
   433	      </div>
   434	    );
   435	  }
   436	  return (
   437	    <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
   438	      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
   439	      <div>
   440	        <p className="font-semibold text-amber-800">Check failed</p>
   441	        <p className="text-sm text-amber-700">{verdict.reason}</p>
   442	      </div>
   443	    </div>
   444	  );
   445	}
   446	
   447	export default App;```

## FILE: tests/availability.test.ts
```ts
     1	import { describe, it, expect, beforeEach } from 'vitest';
     2	import { evaluate, isStrictOverlap, type Booking } from '../src/availability';
     3	
     4	// Fixed clock and fresh fixtures for every test (no shared state between tests).
     5	const NOW = 540; // 09:00
     6	let bookings: Booking[];
     7	let snapshot: Booking[];
     8	
     9	beforeEach(() => {
    10	  bookings = [
    11	    { start: 700, end: 760 },
    12	    { start: 600, end: 660 },
    13	  ]; // deliberately NOT sorted by start
    14	  snapshot = structuredClone(bookings);
    15	});
    16	
    17	describe('AC1 time validation', () => {
    18	  it('T01 rejects start >= end', () => {
    19	    expect(evaluate('700', '650', NOW, false, bookings).kind).toBe('error');
    20	  });
    21	  it('T02 rejects a start that is not after now', () => {
    22	    expect(evaluate('540', '570', NOW, false, bookings).kind).toBe('error');
    23	  });
    24	  it('T03 rejects non-integer input', () => {
    25	    expect(evaluate('600.5', '620', NOW, false, bookings).kind).toBe('error');
    26	  });
    27	});
    28	
    29	describe('AC2 maximum duration', () => {
    30	  it('T04 allows exactly 120 minutes', () => {
    31	    expect(evaluate('800', '920', NOW, false, bookings).kind).toBe('available');
    32	  });
    33	  it('T05 rejects 121 minutes', () => {
    34	    expect(evaluate('800', '921', NOW, false, bookings).kind).toBe('error');
    35	  });
    36	});
    37	
    38	describe('AC3 blocked room', () => {
    39	  it('T06 rejects every request for a blocked room', () => {
    40	    expect(evaluate('800', '830', NOW, true, bookings).kind).toBe('unavailable');
    41	  });
    42	});
    43	
    44	describe('AC4 overlap', () => {
    45	  it('T07 rejects a real overlap', () => {
    46	    expect(evaluate('630', '690', NOW, false, bookings).kind).toBe('unavailable');
    47	  });
    48	  it('T08 allows a booking that touches the end of an existing one (660-700)', () => {
    49	    expect(evaluate('660', '700', NOW, false, bookings).kind).toBe('available');
    50	  });
    51	  it('T09 allows a booking that touches the start of an existing one (560-600)', () => {
    52	    expect(evaluate('560', '600', NOW, false, bookings).kind).toBe('available');
    53	  });
    54	  it('T10 isStrictOverlap is false for touching endpoints', () => {
    55	    expect(isStrictOverlap({ start: 660, end: 700 }, { start: 600, end: 660 })).toBe(false);
    56	  });
    57	});
    58	
    59	describe('AC5 result and non-mutation', () => {
    60	  it('T11 returns Available for a free slot', () => {
    61	    expect(evaluate('800', '830', NOW, false, bookings)).toEqual({ kind: 'available', code: 'AVAILABLE' });
    62	  });
    63	  it('T12 does not change the bookings array (order and values)', () => {
    64	    evaluate('630', '690', NOW, false, bookings);
    65	    evaluate('800', '830', NOW, false, bookings);
    66	    expect(bookings).toEqual(snapshot);
    67	  });
    68	});
```

## FILE: tests/regression.test.ts
```ts
     1	// Practice #10 regression tests for the two mitigated risks (R1 and R2).
     2	import { describe, it, expect } from 'vitest';
     3	import { evaluate, type Booking } from '../src/availability';
     4	import appSource from '../src/App.tsx?raw';
     5	
     6	const NOW = 540; // 09:00, same fixed scenario time as the UI
     7	const UI_BOOKINGS: Booking[] = [{ start: 600, end: 660 }]; // same fixture as App.tsx
     8	
     9	describe('R1 the UI uses the tested rules (single source of truth)', () => {
    10	  it('RG01 App.tsx imports evaluate from @/availability', () => {
    11	    expect(appSource).toMatch(/import\s*\{[^}]*\bevaluate\b[^}]*\}\s*from\s*'@\/availability'/);
    12	  });
    13	  it('RG02 App.tsx has no local copy of the booking rules', () => {
    14	    expect(appSource).not.toMatch(/function\s+evaluate\s*\(/);
    15	    expect(appSource).not.toMatch(/function\s+isStrictOverlap\s*\(/);
    16	    expect(appSource).not.toMatch(/const\s+MAX_DURATION\s*=/);
    17	  });
    18	  it('RG03 the UI messages are produced by the tested module (AC6 wording kept)', () => {
    19	    expect(evaluate('', '', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'error', code: 'INVALID_TIME', reason: 'Please enter both a start and an end time.' });
    20	    expect(evaluate('500', '560', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'error', code: 'PAST_TIME', reason: 'Start must be after the current time (09:00 / 540).' });
    21	    expect(evaluate('630', '690', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'unavailable', code: 'OVERLAP', reason: 'Overlaps an existing booking (10:00–11:00).' });
    22	    expect(evaluate('660', '720', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'available', code: 'AVAILABLE' });
    23	  });
    24	});```

## FILE: tests/reasonCode.test.ts
```ts
     1	// Task 03: the reason code comes from the checker, not from the message wording.
     2	import { describe, it, expect } from 'vitest';
     3	import { evaluate, type Booking } from '../src/availability';
     4	import { deriveReasonCode } from '../src/explain/contract';
     5	
     6	const NOW = 540;
     7	const B: Booking[] = [{ start: 600, end: 660 }];
     8	
     9	describe('Task 03 explicit reason codes', () => {
    10	  it.each([
    11	    ['800', '830', false, 'AVAILABLE'],
    12	    ['630', '690', false, 'OVERLAP'],
    13	    ['800', '830', true, 'BLOCKED'],
    14	    ['', '700', false, 'INVALID_TIME'],
    15	    ['abc', '700', false, 'INVALID_TIME'],
    16	    ['1500', '1600', false, 'INVALID_TIME'],
    17	    ['700', '650', false, 'INVALID_TIME'],
    18	    ['500', '560', false, 'PAST_TIME'],
    19	    ['800', '921', false, 'TOO_LONG'],
    20	  ] as const)('RC %s-%s blocked=%s -> %s', (s, e, blocked, code) => {
    21	    const v = evaluate(s, e, NOW, blocked, B);
    22	    expect(v.code).toBe(code);
    23	    expect(deriveReasonCode(v)).toBe(code);
    24	  });
    25	
    26	  it('RC10 the code does not depend on the message text', () => {
    27	    expect(deriveReasonCode({ kind: 'unavailable', code: 'BLOCKED', reason: 'Reworded message' })).toBe('BLOCKED');
    28	  });
    29	});
```
