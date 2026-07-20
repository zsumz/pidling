import type { FeaturetteFilm, SceneContext } from 'featurette';
import { drawSunrise, SUNRISE_LINE_COUNT } from '../stage/art.js';
import {
    constellationPath,
    drawConstellation,
    type Constellation,
} from '../stage/constellation.js';
import { stageLayout, type StageLayout } from '../stage/layout.js';
import { directResize } from '../stage/resize.js';
import { addBoardLine, drawBoard, type BoardLine } from '../stage/text-board.js';
import { createRunPoints } from '../story/random.js';
import type { StoryState } from '../story/state.js';
import { formatFinalElapsed } from '../story/time.js';

export function addGiftScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('gift', async (context) => {
        const lines: BoardLine[] = [];
        const resize = directResize(context);
        const redrawText = async (): Promise<void> => {
            drawBoard(context, 'gift-copy', textLayout(context), lines);
            await context.cut();
        };
        const add = async (line: BoardLine): Promise<void> => {
            await addBoardLine(context, 'gift-copy', textLayout(context), lines, line);
        };

        resize.setRedraw(redrawText);
        await context.clear();
        await add({ row: 3, speed: 80, text: 'so.', voice: 'process' });
        await add({ row: 5, speed: 62, text: 'not more.', voice: 'process' });
        await add({ row: 7, speed: 52, text: 'one small true thing.', voice: 'process' });
        await context.beat(800);

        const constellation = createConstellation(state);
        const redrawConstellation = async (): Promise<void> => {
            drawConstellation(context.layer('constellation', { zIndex: 5 }), context.terminal, constellation);
            await context.cut();
        };

        resize.setRedraw(redrawConstellation);
        await context.clear();
        await redrawConstellation();
        await traceConstellation(context, constellation);
        context.layer('tracer').clear();
        await context.cut();
        await context.beat(700);

        lines.length = 0;
        resize.setRedraw(redrawText);
        await context.clear();
        await add({ row: 1, speed: 48, text: 'a shape made from this run.', voice: 'process' });
        await add({ row: 3, speed: 48, text: 'this one only happened here.', voice: 'process' });

        if (state.viewer) {
            await add({ row: 6, speed: 44, text: `the shell called you ${state.viewer.display}.`, voice: 'process' });
            await add({ row: 8, speed: 44, text: 'so i gave this one your name.', voice: 'process' });
        }

        await add({ row: 11, speed: 52, text: 'i will not save it.', voice: 'process' });
        await context.beat(1000);

        let sunriseLines = 0;
        const redrawSunrise = async (): Promise<void> => {
            drawSunrise(context.layer('sunrise', { zIndex: 5 }), context.terminal, sunriseLines);
            await context.cut();
        };

        resize.setRedraw(redrawSunrise);
        await context.clear();
        await context.effects.keyframes({
            duration: 1800,
            frames: SUNRISE_LINE_COUNT,
            layer: 'sunrise',
            draw: ({ frame, layer }) => {
                sunriseLines = frame + 1;
                if (layer) drawSunrise(layer, context.terminal, sunriseLines);
            },
        });
        await context.beat(700);

        lines.length = 0;
        resize.setRedraw(redrawText);
        await context.clear();
        await add({ row: 1, speed: 58, text: 'i cannot stay.', voice: 'process' });
        await add({ row: 4, speed: 46, text: 'but i can leave the terminal', voice: 'process' });
        await add({ row: 5, speed: 46, text: 'a little warmer than i found it.', voice: 'process' });
        await add({
            row: 8,
            speed: 0,
            text: `time alive: ${formatFinalElapsed(state.startedAt, state.now())}`,
            voice: 'system',
        });
        await add({
            row: 10,
            speed: 50,
            text: `thank you for running me${state.viewer ? `, ${state.viewer.display}` : ''}.`,
            voice: 'process',
        });
        await add({ row: 12, speed: 0, text: 'returning control...', voice: 'system' });
        await context.beat(800);
        context.layer('prompt').text({ x: textLayout(context).left, y: 'bottom-1' }, '$', {
            bold: true,
            fg: 'life',
        });
        await context.cut();
        await context.beat(650);
        resize.dispose();
    });
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
): Promise<void> {
    await context.effects.keyframes({
        duration: 1400,
        frames: 18,
        layer: 'tracer',
        draw: ({ progress, layer }) => {
            const path = constellationPath(context.terminal, constellation);
            const point = pointOnPath(path, progress);
            layer?.text(point.x, point.y, '*', { bold: true, fg: 'life' });
        },
    });
}

function pointOnPath(path: Array<{ x: number; y: number }>, progress: number): { x: number; y: number } {
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

function textLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 14, maxWidth: 62 });
}
