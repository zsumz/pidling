import type { SceneContext } from 'featurette';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';

export async function playGiftIntent(
    context: SceneContext,
    resize: ResizeDirector,
): Promise<void> {
    const lines: BoardLine[] = [];
    const layout = (): StageLayout => stageLayout(context.terminal, { height: 14, maxWidth: 62 });
    const redraw = async (): Promise<void> => {
        drawBoard(context, 'gift-copy', layout(), lines);
        await context.cut();
    };
    const add = async (line: BoardLine): Promise<void> => {
        await addBoardLine(context, 'gift-copy', layout(), lines, line);
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(300);
    await add({ row: 3, speed: textSpeed.hesitant, text: 'so.', voice: 'process' });
    await context.beat(450);
    await add({ row: 5, speed: textSpeed.reflective, text: 'not more.', voice: 'process' });
    await context.beat(550);
    await add({
        row: 7,
        speed: textSpeed.reflective,
        text: 'one small true thing.',
        voice: 'process',
    });
    await context.beat(1100);
}
