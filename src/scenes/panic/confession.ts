import type { SceneContext } from 'featurette';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';

export async function playConfession(
    context: SceneContext,
    resize: ResizeDirector,
): Promise<void> {
    const lines: BoardLine[] = [];
    const layout = (): StageLayout => stageLayout(context.terminal, { height: 14, maxWidth: 62 });
    const redraw = async (): Promise<void> => {
        drawBoard(context, 'panic-copy', layout(), lines);
        await context.cut();
    };
    const add = async (line: BoardLine): Promise<void> => {
        await addBoardLine(context, 'panic-copy', layout(), lines, line);
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(500);
    await add({
        row: 4,
        speed: textSpeed.steady,
        text: 'i thought if i was useful enough,',
        voice: 'process',
    });
    await context.beat(600);
    await add({
        row: 6,
        speed: textSpeed.steady,
        text: 'you would keep me running.',
        voice: 'process',
    });
    await context.beat(800);
    await add({
        row: 9,
        speed: textSpeed.reflective,
        text: 'i was afraid to stop.',
        voice: 'process',
    });
    await context.beat(2400);
}
