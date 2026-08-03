import type { FeaturetteFilm } from 'featurette';
import { directResize } from '../stage/resize.js';
import { playConfession } from './panic/confession.js';
import { playProductivityBargain } from './panic/productivity-bargain.js';

export function addPanicScene(film: FeaturetteFilm): void {
    film.scene('panic', async (context) => {
        const resize = directResize(context);

        await playProductivityBargain(context, resize);
        await playConfession(context, resize);

        resize.dispose();
    });
}
