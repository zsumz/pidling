import type { SceneContext } from 'featurette';
import { stageLayout, type StageLayout } from '../../stage/layout.js';
import { drawPlace, placeScenePictureLayout } from '../../stage/place.js';
import type { ResizeDirector } from '../../stage/resize.js';
import {
    addBoardLine,
    drawBoard,
    type BoardLine,
} from '../../stage/text-board.js';
import { textSpeed } from '../../story/pacing.js';
import type { StoryState } from '../../story/state.js';

export async function playPlace(
    context: SceneContext,
    state: StoryState,
    resize: ResizeDirector,
): Promise<void> {
    const captions: BoardLine[] = [];
    let missingStars = 0;
    const redraw = async (): Promise<void> => {
        await drawPlace(
            context,
            state.runSeed,
            0,
            placeScenePictureLayout(context.terminal),
            missingStars,
        );
        drawBoard(context, 'place-copy', placeStageLayout(context), positionLines(context, captions));
        await context.cut();
    };

    resize.setRedraw(redraw);
    await context.clear();
    await context.beat(280);
    await drawPlace(context, state.runSeed, 1100, placeScenePictureLayout(context.terminal));

    await addLine(context, captions, 'i made you a place.', 'process');
    await context.beat(650);
    await addLine(
        context,
        captions,
        `this room is ${String(context.terminal.columns)} by ${String(context.terminal.rows)} cells.`,
        'system',
    );
    await context.beat(650);
    await addLine(context, captions, 'i have to keep drawing it.', 'process');
    await context.beat(800);
    await addLine(context, captions, 'you are still there.', 'process');
    await context.beat(1200);
    missingStars = 1;
    await redraw();
    await context.beat(1700);
}

function placeStageLayout(context: SceneContext): StageLayout {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    return stageLayout(context.terminal, { height: compact ? 16 : 22, maxWidth: 64 });
}

function positionLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    const rows = placeStageLayout(context).compact ? [10, 11, 13, 15] : [15, 17, 18, 20];

    return lines.map((line, index) => ({
        ...line,
        row: rows[Math.min(index, rows.length - 1)],
    }));
}

async function addLine(
    context: SceneContext,
    lines: BoardLine[],
    text: string,
    voice: string,
): Promise<void> {
    const row = positionLines(context, [...lines, { row: 0, text }]).at(-1)?.row ?? 0;

    await addBoardLine(context, 'place-copy', placeStageLayout(context), lines, {
        row,
        speed: voice === 'system' ? 0 : textSpeed.steady,
        text,
        voice,
    });
}
