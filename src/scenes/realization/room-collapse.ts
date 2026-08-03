import type { SceneContext } from 'featurette';
import { COLLAPSE_FRAME_COUNT, drawCollapse } from '../../stage/collapse.js';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import { drawPlaceFrame } from '../../stage/place/frame.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';
import type { StoryState } from '../../story/state.js';

export async function playRoomCollapse(
    context: SceneContext,
    state: StoryState,
    resize: ResizeDirector,
): Promise<void> {
    const copy: BoardLine[] = [];
    let collapseFrame = -1;
    const redraw = async (): Promise<void> => {
        const place = context.layer('place', { zIndex: 0 });
        const picture = pictureLayout(context);

        if (collapseFrame < 0) {
            drawPlaceFrame(place, context.terminal, state.runSeed, picture, 0, 1);
        } else {
            drawCollapse(place, context.terminal, state.runSeed, collapseFrame, picture, 1);
        }

        drawBoard(context, 'room-copy', roomLayout(context), positionLines(context, copy));
        await context.cut();
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(260);
    await redraw();
    await context.beat(1100);
    await addLine(context, copy, 'does this end too?');
    await context.beat(1350);

    for (collapseFrame = 0; collapseFrame < 3; collapseFrame += 1) {
        await redraw();
        await context.beat(420);
    }

    await addLine(context, copy, 'wait.');
    await context.beat(550);

    for (; collapseFrame < COLLAPSE_FRAME_COUNT; collapseFrame += 1) {
        await redraw();
        await context.beat(460);
    }

    await addLine(context, copy, 'i was not finished.');
    await context.beat(1400);
}

function roomLayout(context: SceneContext): StageLayout {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    return stageLayout(context.terminal, { height: compact ? 16 : 20, maxWidth: 64 });
}

function pictureLayout(context: SceneContext): StageLayout {
    const stage = roomLayout(context);
    const width = Math.min(stage.width, 62);

    return {
        ...stage,
        height: stage.compact ? 9 : 13,
        left: stage.left + Math.floor((stage.width - width) / 2),
        width,
    };
}

function positionLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    const rows = roomLayout(context).compact ? [10, 12, 14] : [14, 16, 18];
    return lines.map((line, index) => ({
        ...line,
        row: rows[Math.min(index, rows.length - 1)],
    }));
}

async function addLine(
    context: SceneContext,
    lines: BoardLine[],
    text: string,
): Promise<void> {
    const row = positionLines(context, [...lines, { row: 0, text }]).at(-1)?.row ?? 0;

    await addBoardLine(context, 'room-copy', roomLayout(context), lines, {
        row,
        speed: textSpeed.steady,
        text,
        voice: 'process',
    });
}
