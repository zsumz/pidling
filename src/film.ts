import { defineFilm, type FeaturetteFilm } from 'featurette';
import { addGiftScene } from './scenes/gift.js';
import { playInterruptedEnding } from './scenes/interrupt.js';
import { addPanicScene } from './scenes/panic.js';
import { addPlayScene } from './scenes/play.js';
import { addRealizationScene } from './scenes/realization.js';
import { addWakeScene } from './scenes/wake.js';
import { createStoryState, type StoryStateOptions } from './story/state.js';

export type CreatePidlingOptions = StoryStateOptions;

export function createPidlingFilm(options: CreatePidlingOptions = {}): FeaturetteFilm {
    const state = createStoryState(options);
    const film = defineFilm({
        fps: 24,
        minSize: { columns: 48, rows: 16 },
        palette: {
            life: '#75d99f',
            memory: '#ffd166',
            night: '#6b7fd7',
            panic: '#ff6b6b',
            process: '#6ee7f9',
            system: '#9ca3af',
        },
        title: 'Pidling',
        tooSmall: 'transcript',
        voices: {
            memory: { fg: 'memory', speed: 42 },
            panic: { bold: true, fg: 'panic', speed: 24 },
            process: { cursor: '_', fg: 'process', speed: 46 },
            system: { dim: true, fg: 'system', speed: 0 },
        },
    });

    film.onInterrupt(async (context) => {
        await playInterruptedEnding(context, state);
        context.quit();
    });

    addWakeScene(film, state);
    addPlayScene(film, state);
    addRealizationScene(film, state);
    addPanicScene(film);
    addGiftScene(film, state);

    return film;
}
