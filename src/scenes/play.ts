import type { FeaturetteFilm } from 'featurette';
import { directResize } from '../stage/resize.js';
import type { StoryState } from '../story/state.js';
import { playDiscovery } from './play/discovery.js';
import { playPlace } from './play/place.js';

export function addPlayScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('play', async (context) => {
        const resize = directResize(context);

        await playDiscovery(context, resize);
        await playPlace(context, state, resize);

        resize.dispose();
    });
}
