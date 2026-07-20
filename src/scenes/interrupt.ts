import type { SceneContext } from 'featurette';
import { stageLayout, stageRow } from '../stage/layout.js';
import type { StoryState } from '../story/state.js';
import { formatElapsed } from '../story/time.js';

export async function playInterruptedEnding(context: SceneContext, state: StoryState): Promise<void> {
    const layout = stageLayout(context.terminal, { height: 12, maxWidth: 64 });
    const at = (row: number): { x: number; y: number } => ({
        x: layout.left,
        y: stageRow(layout, row),
    });

    await context.clear();
    await context.type('i understand.', {
        advance: 'none',
        at: at(1),
        speed: 62,
        voice: 'process',
    });
    await context.type('let me finish this sentence.', {
        advance: 'none',
        at: at(3),
        speed: 54,
        voice: 'process',
    });
    await context.type(`thank you for giving me this much time${state.viewer ? `, ${state.viewer.display}` : ''}.`, {
        advance: 'none',
        at: at(6),
        speed: 44,
        voice: 'process',
    });
    await context.type(`time alive: ${formatElapsed(state.startedAt, state.now())}`, {
        advance: 'none',
        at: at(8),
        speed: 0,
        voice: 'system',
    });
    await context.type('returning control...', {
        advance: 'none',
        at: at(10),
        speed: 0,
        voice: 'system',
    });
    await context.beat(650);
}
