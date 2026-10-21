
export interface SavedRecording {
  id: string;
  title: string;
  path: string;
  durationMs: number;
  createdAt: number;
}

export type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'saving'
  | 'playing';
