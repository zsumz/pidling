import type { SceneContext, TerminalInfo } from 'featurette';
import { stageLayout, type StageLayout } from './layout.js';
import { drawPlaceFrame } from './place/frame.js';

export { drawPlaceFrame } from './place/frame.js';

export async function drawPlace(
    context: SceneContext,
    runSeed: number,
    duration = 0,
    placement?: StageLayout,
    missingStars = 0,
): Promise<void> {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    const layout = placement ?? stageLayout(context.terminal, { height: compact ? 9 : 13, maxWidth: 62 });
    drawPlaceFrame(
        context.layer('place', { zIndex: 0 }),
        context.terminal,
        runSeed,
        layout,
        0,
        missingStars,
    );

    await context.cut();
    await context.beat(duration);
}

export function placeScenePictureLayout(terminal: TerminalInfo): StageLayout {
    const compact = terminal.columns < 72 || terminal.rows < 22;
    const stage = stageLayout(terminal, { height: compact ? 16 : 22, maxWidth: 64 });
    const width = Math.min(stage.width, 62);

    return {
        ...stage,
        height: compact ? 9 : 13,
        left: stage.left + Math.floor((stage.width - width) / 2),
        width,
    };
}
