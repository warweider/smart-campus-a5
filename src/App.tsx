import { useMemo, useState } from 'react';
import {
  DoorOpen,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Building2,
  Info,
  Sparkles,
} from 'lucide-react';
import { evaluate, toHHMM, DAY_MINUTES, MAX_DURATION, type Booking, type Verdict } from '@/availability';
import { deriveReasonCode, type ExplainInput } from './explain/contract';
import { getExplanation, type ExplainResult } from './explain/explainService';

const QUESTION_MAX = 200;

const ROOM_NAME = 'Room B-204';
const DEFAULT_NOW = 540; // 09:00
const DEFAULT_BOOKINGS = [{ start: 600, end: 660 }]; // 10:00 - 11:00

function App() {
  const [now] = useState(DEFAULT_NOW);
  const [blocked, setBlocked] = useState(false);
  const [bookings] = useState<Booking[]>(DEFAULT_BOOKINGS);

  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const [question, setQuestion] = useState('');
  const [explainState, setExplainState] = useState<
    { status: 'idle' } | { status: 'loading' } | { status: 'done'; result: ExplainResult }
  >({ status: 'idle' });
  const [explainInput, setExplainInput] = useState<ExplainInput | null>(null);

  const parsedPreview = useMemo(() => {
    const s = Number(startInput);
    const e = Number(endInput);
    if (
      /^\d+$/.test(startInput.trim()) &&
      /^\d+$/.test(endInput.trim()) &&
      s < e
    ) {
      return { start: s, end: e, valid: true };
    }
    return { valid: false } as const;
  }, [startInput, endInput]);

  const handleCheck = () => {
    setVerdict(evaluate(startInput, endInput, now, blocked, bookings));
    setExplainState({ status: 'idle' });
    setExplainInput(null);
  };

  const handleReset = () => {
    setStartInput('');
    setEndInput('');
    setVerdict(null);
    setQuestion('');
    setExplainState({ status: 'idle' });
    setExplainInput(null);
  };

  const handleExplain = () => {
    if (!verdict) return;
    const start = Number(startInput.trim());
    const end = Number(endInput.trim());
    const input: ExplainInput = {
      roomLabel: ROOM_NAME,
      start: Number.isInteger(start) && start >= 0 ? start : 0,
      end: Number.isInteger(end) && end <= 1440 ? end : 1440,
      isAvailable: verdict.kind === 'available',
      reasonCode: deriveReasonCode(verdict),
    };
    setExplainInput(input);
    setExplainState({ status: 'loading' });
    getExplanation(input).then((result) => {
      setExplainState({ status: 'done', result });
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-500">Northgate University</p>
            <h1 className="text-lg font-semibold tracking-tight">Smart Campus Room Checker</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 grid gap-6 lg:grid-cols-5">
        {/* Left: Room status + timeline */}
        <section className="lg:col-span-3 space-y-6">
          {/* Room card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <DoorOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Selected room</p>
                  <h2 className="text-xl font-semibold">{ROOM_NAME}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium">Now: {toHHMM(now)}</span>
                <span className="text-xs text-slate-400">({now} min)</span>
              </div>
            </div>

            {/* Blocked toggle */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <ShieldAlert
                  className={`h-5 w-5 ${blocked ? 'text-rose-500' : 'text-slate-300'}`}
                />
                <div>
                  <p className="text-sm font-medium">Room status</p>
                  <p className="text-xs text-slate-500">
                    {blocked ? 'Blocked — all requests are unavailable.' : 'Open for booking requests.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={blocked}
                onClick={() => {
                  setBlocked((b) => !b);
                  setVerdict(null);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  blocked ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    blocked ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Today's schedule</h3>
              <span className="text-xs text-slate-400">00:00 → 24:00</span>
            </div>

            <Timeline
              now={now}
              bookings={bookings}
              proposed={parsedPreview.valid ? parsedPreview : null}
            />

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <LegendDot className="bg-amber-400" label="Current time" />
              <LegendDot className="bg-teal-500" label="Existing booking" />
              <LegendDot className="bg-sky-500" label="Your request" />
            </div>
          </div>

          {/* Existing bookings list */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Existing bookings</h3>
            <ul className="mt-3 space-y-2">
              {bookings.map((b, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <CalendarCheck className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium">
                      {toHHMM(b.start)} – {toHHMM(b.end)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{b.end - b.start} min</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 text-xs text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Intervals that only touch at an endpoint (e.g. 11:00 start when a booking ends at 11:00) do not overlap.
            </p>
          </div>
        </section>

        {/* Right: Checker form */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24">
            <h3 className="text-base font-semibold">Check availability</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter times as minutes after midnight. Max {MAX_DURATION} minutes.
            </p>

            <div className="mt-5 space-y-4">
              <Field
                label="Start (min)"
                hint={startInput && /^\d+$/.test(startInput.trim()) ? toHHMM(Number(startInput)) : undefined}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={startInput}
                  onChange={(e) => {
                    setStartInput(e.target.value);
                    setVerdict(null);
                  }}
                  placeholder="e.g. 660"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </Field>
              <Field
                label="End (min)"
                hint={endInput && /^\d+$/.test(endInput.trim()) ? toHHMM(Number(endInput)) : undefined}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={endInput}
                  onChange={(e) => {
                    setEndInput(e.target.value);
                    setVerdict(null);
                  }}
                  placeholder="e.g. 720"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </Field>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCheck}
                className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Check availability
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            {verdict && <ResultPanel verdict={verdict} />}

            {verdict && (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <Field label="Question (optional, max 200 characters)">
                  <textarea
                    value={question}
                    maxLength={QUESTION_MAX}
                    rows={2}
                    onChange={(e) => {
                      const raw = e.target.value;
                      let next = '';
                      for (let i = 0; i < raw.length; i++) {
                        const code = raw.charCodeAt(i);
                        if (code >= 0x20 && code !== 0x7f) next += raw[i];
                      }
                      setQuestion(next);
                    }}
                    placeholder="e.g. Why is this slot unavailable?"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </Field>
                <button
                  type="button"
                  onClick={handleExplain}
                  disabled={explainState.status === 'loading'}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {explainState.status === 'loading' ? 'Explaining…' : 'Explain availability'}
                </button>

                {explainState.status === 'done' && explainInput && (
                  <div className="mt-4 rounded-lg bg-violet-50 p-3 ring-1 ring-violet-200" role="note">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-violet-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI-generated explanation (may be imperfect)
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                      {explainState.result.output.explanation}
                    </p>
                    {explainState.result.usedFallback && (
                      <p className="mt-1 text-xs text-slate-500">
                        The explanation service could not be reached; this is a standard fallback message.
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      The confirmed status above is authoritative and never changes based on this text.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 text-center text-xs text-slate-400">
        Prototype only — checks availability, does not create bookings. All data is fictional.
      </footer>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

function Timeline({
  now,
  bookings,
  proposed,
}: {
  now: number;
  bookings: Booking[];
  proposed: { start: number; end: number } | null;
}) {
  const ticks = [0, 360, 720, 1080, 1440];
  return (
    <div className="mt-4">
      <div className="relative h-10 w-full rounded-md bg-slate-100 overflow-hidden">
        {/* existing bookings */}
        {bookings.map((b, i) => (
          <div
            key={`b-${i}`}
            className="absolute top-0 h-full bg-teal-500/80"
            style={{
              left: `${(b.start / DAY_MINUTES) * 100}%`,
              width: `${((b.end - b.start) / DAY_MINUTES) * 100}%`,
            }}
            title={`${toHHMM(b.start)}–${toHHMM(b.end)}`}
          />
        ))}
        {/* proposed */}
        {proposed && (
          <div
            className="absolute top-0 h-full bg-sky-500/70 border border-sky-700"
            style={{
              left: `${(proposed.start / DAY_MINUTES) * 100}%`,
              width: `${((proposed.end - proposed.start) / DAY_MINUTES) * 100}%`,
            }}
            title={`Request ${toHHMM(proposed.start)}–${toHHMM(proposed.end)}`}
          />
        )}
        {/* now marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-amber-400"
          style={{ left: `${(now / DAY_MINUTES) * 100}%` }}
        />
      </div>
      <div className="relative mt-1 h-4 text-[10px] text-slate-400">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2"
            style={{ left: `${(t / DAY_MINUTES) * 100}%` }}
          >
            {toHHMM(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ verdict }: { verdict: Verdict }) {
  if (verdict.kind === 'available') {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">Available</p>
          <p className="text-sm text-emerald-700">
            This time slot is free and meets all availability rules.
          </p>
        </div>
      </div>
    );
  }
  if (verdict.kind === 'unavailable') {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div>
          <p className="font-semibold text-rose-800">Unavailable</p>
          <p className="text-sm text-rose-700">{verdict.reason}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold text-amber-800">Check failed</p>
        <p className="text-sm text-amber-700">{verdict.reason}</p>
      </div>
    </div>
  );
}

export default App;