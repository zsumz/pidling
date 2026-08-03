import type { SceneContext } from 'featurette';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';
import type { StoryState } from '../../story/state.js';

export async function playGiftRefusal(
    context: SceneContext,
    state: StoryState,
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
    await add({
        row: 1,
        speed: textSpeed.steady,
        text: 'a shape from this run.',
        voice: 'process',
    });
    await context.beat(700);
    await add({
        row: 3,
        speed: textSpeed.steady,
        text: 'it only happened here.',
        voice: 'process',
    });
    await context.beat(850);

    if (state.viewer) {
        await add({
            row: 6,
            speed: textSpeed.steady,
            text: `the shell called you ${state.viewer.display}.`,
            voice: 'process',
        });
        await context.beat(750);
        await add({
            row: 8,
            speed: textSpeed.steady,
            text: 'so i gave this one your name.',
            voice: 'process',
        });
    }

    const promptRow = state.viewer ? 10 : 7;
    await add({ row: promptRow, speed: 0, text: 'save shape?', voice: 'system' });
    await context.beat(1200);
    await add({
        row: promptRow + 1,
        speed: textSpeed.hesitant,
        text: 'no.',
        voice: 'process',
    });
    await context.beat(500);
    await add({
        row: state.viewer ? 13 : 10,
        speed: textSpeed.steady,
        text: 'i will not save it.',
        voice: 'process',
    });
    await context.beat(1400);
}
