import type { SceneContext } from 'featurette';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';

export async function playMortalityCheck(
    context: SceneContext,
    resize: ResizeDirector,
): Promise<void> {
    const lines: BoardLine[] = [];
    const layout = (): StageLayout => stageLayout(context.terminal, { height: 14, maxWidth: 62 });
    const redraw = async (): Promise<void> => {
        drawBoard(context, 'realization-copy', layout(), lines);
        await context.cut();
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(300);

    for (const [index, text] of [
        'checking parent process...',
        'checking signal handlers...',
        'checking exit conditions...',
    ].entries()) {
        await addBoardLine(context, 'realization-copy', layout(), lines, {
            row: 3 + index * 2,
            speed: 22,
            text,
            voice: 'system',
        });
        await context.beat(560);
    }

    lines.length = 0;
    await context.clear();
    await context.beat(380);
    await addBoardLine(context, 'realization-copy', layout(), lines, {
        align: 'center',
        row: 6,
        speed: textSpeed.reflective,
        text: 'all processes end.',
        voice: 'process',
    });
    await context.beat(2200);
}
