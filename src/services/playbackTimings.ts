// src/services/playbackTimings.ts
//
// Detailed timing log for every song switch (Next, Previous, auto-advance,
// lock screen, tapping a song). One "trace" per switch, from the trigger
// until audio is actually playing.
//
// In Metro you get, per switch:
//   [KarKabTiming] #7 ✅ player next → "وضاحة" | preloaded (native skip) | source original | API 0 ms | total 412 ms
//      +0 ms     trigger: player next
//      +4 ms     skipToNext()
//      +9 ms     play() resolved
//      +15 ms    state: loading
//      +398 ms   state: buffering
//      +412 ms   state: playing
//
// History for all songs this session (Metro / debugger console):
//   karkabTimings()        → table of every switch + averages per path
//   karkabTimingsClear()   → reset

const TAG = '[KarKabTiming]';
const MAX_HISTORY = 300;
const SUMMARY_EVERY = 10; // auto-print the summary every N switches

type Status = 'pending' | 'played' | 'failed' | 'replaced';

interface Step {
  label: string;
  t: number;
}

export interface SwitchTrace {
  id: number;
  trigger: string;
  start: number;
  steps: Step[];
  status: Status;
  title?: string;
  songId?: string;
  url?: string;
  source?: string;
  path?: string;
  apiMs: number;
  totalMs?: number;
  note?: string;
}

let seq = 0;
let current: SwitchTrace | null = null;
const history: SwitchTrace[] = [];

const now = (): number =>
  (globalThis as any).performance?.now
    ? Math.round((globalThis as any).performance.now())
    : Date.now();

/** Which file is being played, judged from the URL. */
const classifyUrl = (url?: string): string => {
  if (!url) return '?';
  if (url.startsWith('file://')) return 'local file';
  if (url.includes('uploads/recordings/')) return 'recording';
  if (/_stream\.m4a/i.test(url)) return 'stream';
  if (/_karaoke\.m4a/i.test(url)) return 'karaoke';
  if (/\.wav(\?|$)/i.test(url)) return 'wav';
  if (/songFile-/i.test(url)) return 'original';
  return 'other';
};

const finish = (status: Status, note?: string) => {
  if (!current) return;
  const trace = current;
  current = null;

  trace.status = status;
  trace.totalMs = now() - trace.start;
  if (note) trace.note = note;

  const icon = status === 'played' ? '✅' : status === 'replaced' ? '↪️' : '⚠️';
  console.log(
    `${TAG} #${trace.id} ${icon} ${trace.trigger} → "${trace.title ?? trace.songId ?? '?'}"` +
      ` | ${trace.path ?? 'unknown'} | source ${trace.source ?? '?'}` +
      ` | API ${trace.apiMs} ms | total ${trace.totalMs} ms` +
      (note ? ` | ${note}` : ''),
  );
  trace.steps.forEach(step => {
    const offset = `+${step.t - trace.start} ms`.padEnd(10, ' ');
    console.log(`   ${offset}${step.label}`);
  });
  if (trace.url) console.log(`   url: ${trace.url}`);

  history.push(trace);
  if (history.length > MAX_HISTORY) history.shift();

  if (history.length % SUMMARY_EVERY === 0) printTimingSummary();
};

// -----------------------------------------------------------------------------
// API used by player.ts / service.js / screens
// -----------------------------------------------------------------------------

/** Start a new switch. A still-pending previous switch is closed as "replaced". */
export const beginSwitch = (trigger: string): number => {
  if (current && current.status === 'pending') {
    finish('replaced', 'another switch started before audio played');
  }
  current = {
    id: ++seq,
    trigger,
    start: now(),
    steps: [],
    status: 'pending',
    apiMs: 0,
  };
  current.steps.push({ label: `trigger: ${trigger}`, t: current.start });
  return current.id;
};

export const hasPendingSwitch = () => !!current && current.status === 'pending';

export const currentSwitchId = (): number | null =>
  current && current.status === 'pending' ? current.id : null;

/** Finish the switch with id `id` as played (used when no "playing" state event arrives). */
export const timingAudible = (id: number, label: string) => {
  if (!current || current.id !== id || current.status !== 'pending') return;
  timingStep(label);
  finish('played');
};

/** Add a step to the current switch (starts one if none is running). */
export const timingStep = (label: string) => {
  if (!current) beginSwitch('unknown');
  current!.steps.push({ label, t: now() });
};

/** Record which song + URL this switch is loading. */
export const timingSong = (song: any, url?: string) => {
  if (!current) return;
  current.title = song?.title ?? current.title;
  current.songId = song?.id != null ? String(song.id) : current.songId;
  if (url) {
    current.url = url;
    current.source = classifyUrl(url);
  }
};

/** How the switch is being done (preloaded skip, API + load, ...). Keeps the first value unless forced. */
export const timingPath = (path: string, force = false) => {
  if (!current) return;
  if (!current.path || force) current.path = path;
};

/** Time an API call and add it to this switch's API total. */
export const timeApi = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const t0 = now();
  try {
    return await fn();
  } finally {
    const ms = now() - t0;
    if (current) current.apiMs += ms;
    timingStep(`${label} (${ms} ms)`);
  }
};

/** Native player state changes (from service.js). "playing" completes the switch. */
export const timingPlayerState = (state: string) => {
  if (!current) return;
  const s = String(state).toLowerCase();
  timingStep(`state: ${s}`);
  if (s === 'playing') finish('played');
  if (s === 'error') finish('failed', 'player error');
};

/** Mark the current switch as failed (e.g. no playable URL). */
export const timingFailed = (reason: string) => {
  if (!current) return;
  timingStep(`failed: ${reason}`);
  finish('failed', reason);
};

/** Close the current switch without counting it (e.g. user paused while loading). */
export const timingCancel = (reason: string) => {
  if (!current) return;
  timingStep(`cancelled: ${reason}`);
  finish('failed', reason);
};

// -----------------------------------------------------------------------------
// History
// -----------------------------------------------------------------------------

export const getTimingHistory = (): SwitchTrace[] => [...history];

export const clearTimingHistory = () => {
  history.length = 0;
  console.log(`${TAG} history cleared`);
};

/** Averages per path + per source. */
export const printTimingSummary = () => {
  const played = history.filter(t => t.status === 'played' && t.totalMs != null);
  if (played.length === 0) {
    console.log(`${TAG} no completed switches yet`);
    return;
  }

  const group = (key: (t: SwitchTrace) => string) => {
    const map = new Map<string, number[]>();
    played.forEach(t => {
      const k = key(t);
      map.set(k, [...(map.get(k) ?? []), t.totalMs!]);
    });
    return Array.from(map.entries()).map(([k, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return {
        group: k,
        count: values.length,
        avg_ms: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        median_ms: sorted[Math.floor(sorted.length / 2)],
        max_ms: sorted[sorted.length - 1],
      };
    });
  };

  const failed = history.filter(t => t.status === 'failed').length;
  console.log(
    `${TAG} SUMMARY — ${played.length} played, ${failed} failed, ${history.length} total`,
  );
  console.table([
    ...group(t => `path: ${t.path ?? 'unknown'}`),
    ...group(t => `source: ${t.source ?? '?'}`),
  ]);
};

/** Full table of every switch this session. */
export const printTimingHistory = () => {
  console.table(
    history.map(t => ({
      '#': t.id,
      status: t.status,
      trigger: t.trigger,
      song: t.title ?? t.songId,
      path: t.path,
      source: t.source,
      api_ms: t.apiMs,
      total_ms: t.totalMs,
      note: t.note ?? '',
    })),
  );
  printTimingSummary();
};

// Console helpers (dev only)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  (globalThis as any).karkabTimings = printTimingHistory;
  (globalThis as any).karkabTimingsClear = clearTimingHistory;
}