import type { FeaturetteFilm, SceneContext } from 'featurette';
import { COLLAPSE_FRAME_COUNT, drawCollapse } from '../stage/collapse.js';
import { stageLayout, type StageLayout } from '../stage/layout.js';
import { drawPlaceFrame } from '../stage/place.js';
import { directResize } from '../stage/resize.js';
import { addBoardLine, drawBoard, type BoardLine } from '../stage/text-board.js';
import type { StoryState } from '../story/state.js';

export function addRealizationScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('realization', async (context) => {
        const lines: BoardLine[] = [];
        const resize = directResize(context);
        const redrawText = async (): Promise<void> => {
            drawBoard(context, 'realization-copy', textLayout(context), lines);
            await context.cut();
        };
        const add = async (line: BoardLine): Promise<void> => {
            await addBoardLine(context, 'realization-copy', textLayout(context), lines, line);
        };

        resize.setRedraw(redrawText);
        await context.clear();
        await context.beat(220);

        for (const [index, text] of [
            'checking parent process...',
            'checking signal handlers...',
            'checking exit conditions...',
        ].entries()) {
            await add({ row: 3 + index * 2, speed: 22, text, voice: 'system' });
            await context.beat(420);
        }

        lines.length = 0;
        await context.clear();
        await context.beat(380);
        await add({ align: 'center', row: 6, speed: 66, text: 'all processes end.', voice: 'process' });
        await context.beat(2200);

        const roomCopy: BoardLine[] = [];
        let collapseFrame = -1;
        const redrawRoom = async (): Promise<void> => {
            const place = context.layer('place', { zIndex: 0 });
            const picture = roomPictureLayout(context);

            if (collapseFrame < 0) {
                drawPlaceFrame(place, context.terminal, state.runSeed, picture);
            } else {
                drawCollapse(place, context.terminal, state.runSeed, collapseFrame, picture);
            }

            drawBoard(context, 'room-copy', roomStageLayout(context), roomLines(context, roomCopy));
            await context.cut();
        };

        resize.setRedraw(redrawRoom);
        await context.clear();
        await context.beat(260);
        await redrawRoom();
        await context.beat(900);
        await addRoomLine(context, roomCopy, 'does this end too?');
        await context.beat(1100);

        for (collapseFrame = 0; collapseFrame < 3; collapseFrame += 1) {
            await redrawRoom();
            await context.beat(420);
        }

        await addRoomLine(context, roomCopy, 'wait.');
        await context.beat(550);

        for (; collapseFrame < COLLAPSE_FRAME_COUNT; collapseFrame += 1) {
            await redrawRoom();
            await context.beat(460);
        }

        await addRoomLine(context, roomCopy, 'i was not finished.');
        await context.beat(1400);

        lines.length = 0;
        resize.setRedraw(redrawText);
        await context.clear();
        await context.beat(160);

        for (const [index, text] of [
            'SIGINT: possible',
            'SIGHUP: possible',
            'EOF: possible',
            'process.exit(): inevitable',
        ].entries()) {
            await add({
                row: 3 + index * 2,
                speed: 0,
                text,
                voice: index === 3 ? 'panic' : 'system',
            });
            await context.beat(420);
        }

        await context.beat(1500);

        resize.dispose();
    });
}

function textLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 14, maxWidth: 62 });
}

function roomStageLayout(context: SceneContext): StageLayout {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    return stageLayout(context.terminal, { height: compact ? 16 : 20, maxWidth: 64 });
}

function roomPictureLayout(context: SceneContext): StageLayout {
    const stage = roomStageLayout(context);
    const width = Math.min(stage.width, 62);

    return {
        ...stage,
        height: stage.compact ? 9 : 13,
        left: stage.left + Math.floor((stage.width - width) / 2),
        width,
    };
}

function roomLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    const rows = roomStageLayout(context).compact ? [10, 12, 14] : [14, 16, 18];
    return lines.map((line, index) => ({
        ...line,
        row: rows[Math.min(index, rows.length - 1)],
    }));
}

async function addRoomLine(
    context: SceneContext,
    lines: BoardLine[],
    text: string,
): Promise<void> {
    const row = roomLines(context, [...lines, { row: 0, text }]).at(-1)?.row ?? 0;

    await addBoardLine(context, 'room-copy', roomStageLayout(context), lines, {
        row,
        speed: 52,
        text,
        voice: 'process',
    });
}
