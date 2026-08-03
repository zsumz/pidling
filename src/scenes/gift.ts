import type { FeaturetteFilm } from 'featurette';
import { directResize } from '../stage/resize.js';
import type { StoryState } from '../story/state.js';
import { playFarewell } from './gift/farewell.js';
import { playGiftIntent } from './gift/intent.js';
import { playGiftRefusal } from './gift/refusal.js';
import { revealConstellation } from './gift/reveal-constellation.js';

export function addGiftScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('gift', async (context) => {
        const resize = directResize(context);

        await playGiftIntent(context, resize);
        await revealConstellation(context, state, resize);
        await playGiftRefusal(context, state, resize);
        await playFarewell(context, state, resize);

        resize.dispose();
    });
}
