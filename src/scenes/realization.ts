import type { FeaturetteFilm } from 'featurette';
import { directResize } from '../stage/resize.js';
import type { StoryState } from '../story/state.js';
import { playExitCheck } from './realization/exit-check.js';
import { playMortalityCheck } from './realization/mortality-check.js';
import { playRoomCollapse } from './realization/room-collapse.js';

export function addRealizationScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('realization', async (context) => {
        const resize = directResize(context);

        await playMortalityCheck(context, resize);
        await playRoomCollapse(context, state, resize);
        await playExitCheck(context, resize);

        resize.dispose();
    });
}
