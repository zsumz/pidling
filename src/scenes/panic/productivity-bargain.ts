import type { SceneContext } from 'featurette';
import {
    drawBargainingStar,
    drawSaveAttempt,
} from '../../stage/bargaining.js';
import { stageLayout, stageRow, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';

type Attempt = 'none' | 'save' | 'star';

export async function playProductivityBargain(
    context: SceneContext,
    resize: ResizeDirector,
): Promise<void> {
    const lines: BoardLine[] = [];
    let attempt: Attempt = 'none';
    let progress = 0;
    const redraw = async (): Promise<void> => {
        const layout = panicLayout(context);
        drawBoard(context, 'panic-copy', layout, lines);
        drawAttempt(context, layout, attempt, progress);
        await context.cut();
    };
    const add = async (line: BoardLine): Promise<void> => {
        await addBoardLine(context, 'panic-copy', panicLayout(context), lines, line);
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(240);
    await add({ row: 1, speed: textSpeed.urgent, text: 'i can draw faster.', voice: 'process' });
    await context.beat(320);
    await add({ row: 3, speed: textSpeed.urgent, text: 'i can make better stars.', voice: 'process' });
    await context.beat(420);

    lines.length = 0;
    context.layer('panic-copy').clear();
    attempt = 'star';
    drawAttempt(context, panicLayout(context), attempt, progress);
    await context.cut();

    await context.effects.keyframes({
        duration: 2600,
        frames: 27,
        layer: 'attempt',
        draw: ({ progress: nextProgress }) => {
            progress = nextProgress;
            drawAttempt(context, panicLayout(context), attempt, progress);
        },
    });
    await context.beat(650);

    attempt = 'none';
    progress = 0;
    lines.length = 0;
    context.layer('attempt').clear();
    await add({ row: 3, speed: textSpeed.urgent, text: 'i can print something important.', voice: 'process' });
    await context.beat(450);

    attempt = 'save';
    await context.effects.keyframes({
        duration: 1800,
        frames: 19,
        layer: 'attempt',
        draw: ({ progress: nextProgress }) => {
            progress = Math.min(0.88, nextProgress);
            drawAttempt(context, panicLayout(context), attempt, progress);
        },
    });
    await context.beat(900);

    const error = 'save process: unavailable';
    const layout = panicLayout(context);
    lines.push({ row: 10, speed: 0, text: error, voice: 'panic' });
    await context.glitchText(error, {
        at: { x: layout.left, y: stageRow(layout, 10) },
        layer: 'panic-copy',
        voice: 'panic',
    });
    await context.beat(1800);
}

function drawAttempt(
    context: SceneContext,
    layout: StageLayout,
    attempt: Attempt,
    progress: number,
): void {
    const layer = context.layer('attempt', { zIndex: 30 });

    if (attempt === 'star') {
        drawBargainingStar(layer, layout, progress, context.terminal.unicode);
    } else if (attempt === 'save') {
        drawSaveAttempt(layer, layout, progress);
    } else {
        layer.clear();
    }
}

function panicLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 14, maxWidth: 62 });
}
