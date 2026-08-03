import type { SceneContext } from 'featurette';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';

export async function playExitCheck(
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
    await context.beat(160);

    for (const [index, text] of [
        'SIGINT: possible',
        'SIGHUP: possible',
        'EOF: possible',
        'exit: inevitable',
    ].entries()) {
        await addBoardLine(context, 'realization-copy', layout(), lines, {
            row: 3 + index * 2,
            speed: 0,
            text,
            voice: index === 3 ? 'panic' : 'system',
        });
        await context.beat(420);
    }

    await context.beat(1500);
}
