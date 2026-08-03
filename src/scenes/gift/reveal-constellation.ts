import type { SceneContext } from 'featurette';
import {
    constellationPath,
    drawConstellation,
    type Constellation,
} from '../../stage/constellation.js';
import { createRunPoints } from '../../stage/constellation/run-points.js';
import type { ResizeDirector } from '../../stage/resize.js';
import type { StoryState } from '../../story/state.js';

export async function revealConstellation(
    context: SceneContext,
    state: StoryState,
    resize: ResizeDirector,
): Promise<void> {
    const constellation = createConstellation(state);
    let reveal = 0;
    const redraw = async (): Promise<void> => {
        drawConstellation(
            context.layer('constellation', { zIndex: 5 }),
            context.terminal,
            constellation,
            { reveal },
        );
        await context.cut();
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(350);
    await redraw();
    await context.beat(700);
    await traceConstellation(context, constellation, (progress) => {
        reveal = progress;
    });
    reveal = 1;
    await redraw();
    context.layer('tracer').clear();
    await context.cut();
    await context.beat(3300);
}

function createConstellation(state: StoryState): Constellation {
    return {
        label: state.viewer?.display ?? 'unnamed',
        points: createRunPoints(state.runSeed),
        runLabel: `run:${String(state.pid).slice(-4)}`,
    };
}

async function traceConstellation(
    context: SceneContext,
    constellation: Constellation,
    onProgress: (progress: number) => void,
): Promise<void> {
    await context.effects.keyframes({
        duration: 2600,
        frames: 28,
        layer: 'tracer',
        draw: ({ progress, layer }) => {
            onProgress(progress);
            drawConstellation(
                context.layer('constellation', { zIndex: 5 }),
                context.terminal,
                constellation,
                { reveal: progress },
            );
            const point = pointOnPath(constellationPath(context.terminal, constellation), progress);
            layer?.clear();
            layer?.text(point.x, point.y, context.terminal.unicode ? '✦' : '*', {
                bold: true,
                fg: 'life',
            });
        },
    });
}

function pointOnPath(
    path: Array<{ x: number; y: number }>,
    progress: number,
): { x: number; y: number } {
    const segmentPosition = progress * Math.max(1, path.length - 1);
    const segment = Math.min(path.length - 2, Math.floor(segmentPosition));
    const local = segmentPosition - segment;
    const from = path[segment];
    const to = path[segment + 1] ?? from;

    return {
        x: Math.round(from.x + (to.x - from.x) * local),
        y: Math.round(from.y + (to.y - from.y) * local),
    };
}
