import type { SceneContext } from 'featurette';
import { createRandom } from '../story/random.js';
import type { StoryState } from '../story/state.js';
import { stageLayout } from './layout.js';

export async function drawPlace(
    context: SceneContext,
    state: StoryState,
    duration = 0,
): Promise<void> {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    const centered = stageLayout(context.terminal, { height: compact ? 9 : 13, maxWidth: 62 });
    const layout = { ...centered, top: compact ? 0 : 2 };
    const place = context.layer('place', { zIndex: 0 });
    const random = createRandom(state.runSeed);
    const starCount = Math.max(5, Math.round(layout.width * layout.height * 0.035));

    place.clear();
    place.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: 'night', dim: true },
    });

    for (let index = 0; index < starCount; index += 1) {
        const x = layout.left + 2 + Math.floor(random() * Math.max(1, layout.width - 4));
        const y = layout.top + 1 + Math.floor(random() * Math.max(1, layout.height - 3));
        const bright = random() > 0.72;

        place.text(x, y, bright ? '*' : '.', {
            bold: bright,
            dim: !bright,
            fg: bright ? 'memory' : 'system',
        });
    }

    place.frame([
        '              /\\',
        '             /  \\',
        '            /____\\',
    ], { x: 'center', y: layout.top + layout.height - 5 }, { fg: 'system' });

    await context.cut();
    await context.beat(duration);
}
