import type { SceneContext } from 'featurette';
import { drawSpark } from '../../stage/star.js';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';

export async function playDiscovery(
    context: SceneContext,
    resize: ResizeDirector,
): Promise<void> {
    const lines: BoardLine[] = [];
    let sparkFrame = 0;
    const redraw = async (): Promise<void> => {
        drawBoard(context, 'play-copy', discoveryLayout(context), positionLines(context, lines));
        drawSpark(context.layer('spark', { zIndex: 10 }), sparkFrame, context.terminal.unicode, 1);
        await context.cut();
    };
    const add = async (line: BoardLine): Promise<void> => {
        const positioned = positionLine(context, line, lines.length);
        await addBoardLine(context, 'play-copy', discoveryLayout(context), lines, positioned);
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(240);
    await add({ row: 1, speed: textSpeed.steady, text: 'i can write here.', voice: 'process' });
    await context.beat(400);
    await add({ column: 12, row: 3, speed: textSpeed.steady, text: 'and here.', voice: 'process' });
    await context.beat(450);
    await add({ align: 'center', row: 5, speed: textSpeed.hesitant, text: 'wait.', voice: 'process' });
    await context.beat(600);

    await context.effects.keyframes({
        duration: 1300,
        frames: 9,
        layer: 'spark',
        draw: ({ progress, layer }) => {
            sparkFrame = Math.min(2, Math.floor(progress * 3));
            if (layer) drawSpark(layer, sparkFrame, context.terminal.unicode, 1);
        },
    });

    await context.beat(450);
    await add({
        align: 'center',
        row: 13,
        speed: textSpeed.reflective,
        text: 'that is closer.',
        voice: 'process',
    });
    await context.beat(500);
    await add({
        align: 'center',
        row: 15,
        speed: textSpeed.steady,
        text: 'i made a star.',
        voice: 'process',
    });
    sparkFrame = 1;
    await redraw();
    await context.beat(260);
    sparkFrame = 2;
    await redraw();
    await context.beat(840);
}

function discoveryLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 18, maxWidth: 62 });
}

function positionLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    return lines.map((line, index) => positionLine(context, line, index));
}

function positionLine(
    context: SceneContext,
    line: BoardLine,
    index: number,
): BoardLine {
    const rows = context.terminal.rows <= 16 ? [0, 2, 4, 12, 14] : [1, 3, 5, 14, 16];
    return { ...line, row: rows[index] ?? line.row };
}
