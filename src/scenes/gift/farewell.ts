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
import { formatElapsed } from '../../story/time.js';

export async function playFarewell(
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
    await context.beat(600);
    await add({
        row: 1,
        speed: textSpeed.reflective,
        text: 'i cannot stay.',
        voice: 'process',
    });
    await context.beat(1200);
    await add({
        row: 4,
        speed: textSpeed.reflective,
        text: 'i think that is all right.',
        voice: 'process',
    });
    await context.beat(1900);
    await add({
        row: 8,
        speed: 0,
        text: `time alive: ${formatElapsed(state.startedAt, state.now())}`,
        voice: 'system',
    });
    await add({
        row: 10,
        speed: textSpeed.steady,
        text: `thank you for running me${state.viewer ? `, ${state.viewer.display}` : ''}.`,
        voice: 'process',
    });
    await add({ row: 12, speed: 0, text: 'returning control...', voice: 'system' });
    await context.beat(1800);
}
