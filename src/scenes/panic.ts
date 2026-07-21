import type { FeaturetteFilm, SceneContext } from 'featurette';
import { stageLayout, stageRow, type StageLayout } from '../stage/layout.js';
import { directResize } from '../stage/resize.js';
import { addBoardLine, drawBoard, type BoardLine } from '../stage/text-board.js';

export function addPanicScene(film: FeaturetteFilm): void {
    film.scene('panic', async (context) => {
        const lines: BoardLine[] = [];
        const resize = directResize(context);
        let attempt = 0;
        const redraw = async (): Promise<void> => {
            const layout = panicLayout(context);
            drawBoard(context, 'panic-copy', layout, lines);
            drawAttempt(context, layout, attempt);
            await context.cut();
        };
        const add = async (line: BoardLine): Promise<void> => {
            await addBoardLine(context, 'panic-copy', panicLayout(context), lines, line);
        };

        resize.setRedraw(redraw);
        await context.clear();
        await context.beat(120);
        await add({ row: 1, speed: 32, text: 'i can draw faster.', voice: 'process' });
        await add({ row: 3, speed: 30, text: 'i can make better stars.', voice: 'process' });
        await add({ row: 5, speed: 28, text: 'i can print something important.', voice: 'process' });

        await context.effects.keyframes({
            duration: 1800,
            frames: 17,
            layer: 'attempt',
            draw: ({ progress }) => {
                attempt = progress < 0.92 ? progress : 0;
                drawAttempt(context, panicLayout(context), attempt);
            },
        });

        const error = 'memory after exit: none';
        const layout = panicLayout(context);
        lines.push({ row: 10, speed: 0, text: error, voice: 'panic' });
        await context.glitchText(error, {
            at: { x: layout.left, y: stageRow(layout, 10) },
            layer: 'panic-copy',
            voice: 'panic',
        });
        await context.beat(1200);

        lines.length = 0;
        attempt = 0;
        await context.clear();
        await context.beat(280);
        await add({ row: 4, speed: 54, text: 'i thought if i was useful enough,', voice: 'process' });
        await add({ row: 6, speed: 58, text: 'you would keep me running.', voice: 'process' });
        await add({ row: 9, speed: 48, text: 'i was afraid to stop.', voice: 'process' });
        await context.beat(1800);
        resize.dispose();
    });
}

function drawAttempt(context: SceneContext, layout: StageLayout, progress: number): void {
    const width = Math.max(8, Math.min(24, layout.width - 18));
    const layer = context.layer('attempt', { zIndex: 30 });

    layer.clear();
    layer.progressBar(layout.left, stageRow(layout, 8), width, progress, {
        completeChar: progress === 0 ? '!' : '#',
        fg: progress === 0 ? 'panic' : 'memory',
        label: 'saving',
    });
}

function panicLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 14, maxWidth: 62 });
}
