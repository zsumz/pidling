import { hashText } from './run-seed.js';
import type { ViewerName } from './viewer.js';

export interface StoryState {
    now: () => number;
    pid: number;
    runSeed: number;
    startedAt: number;
    viewer?: ViewerName;
}

export interface StoryStateOptions {
    now?: () => number;
    pid?: number;
    startedAt?: number;
    viewer?: ViewerName;
}

export function createStoryState(options: StoryStateOptions = {}): StoryState {
    const now = options.now ?? Date.now;
    const startedAt = options.startedAt ?? now();
    const pid = options.pid ?? process.pid;
    const viewer = options.viewer;

    return {
        now,
        pid,
        runSeed: hashText(`${String(pid)}:${String(startedAt)}:${viewer?.raw ?? 'unknown'}`),
        startedAt,
        viewer,
    };
}
