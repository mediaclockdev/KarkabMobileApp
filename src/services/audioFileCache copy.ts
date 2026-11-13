// src/services/audioFileCache.ts
//
// Downloads the NEXT song's audio file to the phone while the current song
// plays, so pressing Next plays from a local file (starts in ~0.1 s) instead
// of buffering from the network (3–5 s).
//
// - Files live in the app cache folder (iOS/Android may clear it when low on space).
// - Only the newest MAX_FILES are kept.
// - Downloads use a ".part" file and are renamed when complete, so a
//   half-downloaded file is never played.

import ReactNativeBlobUtil from 'react-native-blob-util';

const { fs } = ReactNativeBlobUtil;

const TAG = '[KarKabAudioCache]';
const DIR = `${fs.dirs.CacheDir}/karkab-audio`;
const MAX_FILES = 10;

const log = (...args: any[]) => console.log(TAG, ...args);

/** remote URL → local path, for files known to be fully downloaded */
const ready = new Map<string, string>();
/** remote URL → running download */
const inFlight = new Map<string, Promise<string | null>>();

let initPromise: Promise<void> | null = null;

const hash = (value: string): string => {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

const extensionOf = (url: string): string => {
  const match = url.split('?')[0].match(/\.(m4a|mp3|aac|mp4)$/i);
  return match ? match[0].toLowerCase() : '.m4a';
};

const pathFor = (url: string) => `${DIR}/${hash(url)}${extensionOf(url)}`;

const isRemote = (url?: string | null): url is string =>
  typeof url === 'string' && /^https?:\/\//i.test(url);

/** Create the folder and remove leftovers from interrupted downloads. Safe to call often. */
export const initAudioFileCache = (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        if (!(await fs.exists(DIR))) await fs.mkdir(DIR);
        const names: string[] = await fs.ls(DIR);
        await Promise.all(
          names
            .filter(name => name.endsWith('.part'))
            .map(name => fs.unlink(`${DIR}/${name}`).catch(() => {})),
        );
      } catch (error) {
        log('init failed:', error);
      }
    })();
  }
  return initPromise;
};

/** Local file:// URL if this remote URL is already downloaded, else null. */
export const getCachedAudioUrl = async (url?: string | null): Promise<string | null> => {
  if (!isRemote(url)) return null;
  const known = ready.get(url);
  if (known) {
    if (await fs.exists(known)) return `file://${known}`;
    ready.delete(url); // removed by the OS or by pruning
  }
  await initAudioFileCache();
  const path = pathFor(url);
  try {
    if (await fs.exists(path)) {
      ready.set(url, path);
      return `file://${path}`;
    }
  } catch {}
  return null;
};

/** True while this URL is being downloaded. */
export const isDownloadingAudio = (url?: string | null) => !!url && inFlight.has(url);

/** Keep only the newest MAX_FILES files (never deletes `keep`). */
const prune = async (keep: string[]) => {
  try {
    const names: string[] = await fs.ls(DIR);
    const files = await Promise.all(
      names
        .filter(name => !name.endsWith('.part'))
        .map(async name => {
          const path = `${DIR}/${name}`;
          try {
            const stat: any = await fs.stat(path);
            return { path, time: Number(stat?.lastModified) || 0 };
          } catch {
            return { path, time: 0 };
          }
        }),
    );
    files.sort((a, b) => b.time - a.time);
    const extra = files.slice(MAX_FILES).filter(f => !keep.includes(f.path));
    await Promise.all(extra.map(f => fs.unlink(f.path).catch(() => {})));
    for (const [url, path] of ready) {
      if (extra.some(f => f.path === path)) ready.delete(url);
    }
  } catch (error) {
    log('prune failed:', error);
  }
};

/**
 * Download a remote audio file (once). Resolves to a file:// URL, or null on failure.
 * Calling it again for the same URL returns the same running download.
 */
export const downloadAudio = (url?: string | null): Promise<string | null> => {
  if (!isRemote(url)) return Promise.resolve(null);
  const running = inFlight.get(url);
  if (running) return running;

  const task = (async () => {
    const cached = await getCachedAudioUrl(url);
    if (cached) return cached;

    await initAudioFileCache();
    const target = pathFor(url);
    const tmp = `${target}.part`;
    const started = Date.now();

    try {
      const res = await ReactNativeBlobUtil.config({ path: tmp }).fetch('GET', url);
      const status = res.info().status;
      if (status !== 200) {
        log(`download failed (HTTP ${status}):`, url);
        await fs.unlink(tmp).catch(() => {});
        return null;
      }
      if (await fs.exists(target)) await fs.unlink(target).catch(() => {});
      await fs.mv(tmp, target);
      ready.set(url, target);
      log(`downloaded in ${Date.now() - started} ms:`, url);
      prune([target]);
      return `file://${target}`;
    } catch (error) {
      log('download error:', error);
      await fs.unlink(tmp).catch(() => {});
      return null;
    } finally {
      inFlight.delete(url);
    }
  })();

  inFlight.set(url, task);
  return task;
};

/** Delete every cached audio file (e.g. from a settings screen). */
export const clearAudioFileCache = async () => {
  try {
    if (await fs.exists(DIR)) await fs.unlink(DIR);
    ready.clear();
    initPromise = null;
    await initAudioFileCache();
    log('cleared');
  } catch (error) {
    log('clear failed:', error);
  }
};