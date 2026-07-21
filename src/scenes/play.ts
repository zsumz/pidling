import type { FeaturetteFilm, SceneContext } from 'featurette';
import { drawSpark } from '../stage/art.js';
import { stageLayout, type StageLayout } from '../stage/layout.js';
import { drawPlace } from '../stage/place.js';
import { directResize } from '../stage/resize.js';
import { addBoardLine, drawBoard, type BoardLine } from '../stage/text-board.js';
import type { StoryState } from '../story/state.js';

export function addPlayScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('play', async (context) => {
        const lines: BoardLine[] = [];
        const resize = directResize(context);
        let sparkFrame = 0;
        const redrawSpark = async (): Promise<void> => {
            drawBoard(context, 'play-copy', playLayout(context), discoveryLines(context, lines));
            drawSpark(context.layer('spark', { zIndex: 10 }), sparkFrame, context.terminal.unicode);
            await context.cut();
        };
        const add = async (line: BoardLine): Promise<void> => {
            const positioned = positionDiscoveryLine(context, line, lines.length);
            await addBoardLine(context, 'play-copy', playLayout(context), lines, positioned);
        };

        resize.setRedraw(redrawSpark);
        await context.clear();
        await context.beat(240);
        await add({ row: 1, speed: 44, text: 'i can write here.', voice: 'process' });
        await context.beat(260);
        await add({ column: 12, row: 3, speed: 44, text: 'and here.', voice: 'process' });
        await context.beat(300);
        await add({ align: 'center', row: 5, speed: 64, text: 'wait.', voice: 'process' });
        await context.beat(450);

        await context.effects.keyframes({
            duration: 1300,
            frames: 9,
            layer: 'spark',
            draw: ({ progress, layer }) => {
                sparkFrame = Math.min(2, Math.floor(progress * 3));
                if (layer) drawSpark(layer, sparkFrame, context.terminal.unicode);
            },
        });

        await context.beat(450);
        await add({ align: 'center', row: 13, speed: 48, text: 'that is closer.', voice: 'process' });
        await context.beat(350);
        await add({ align: 'center', row: 15, speed: 46, text: 'i made a star.', voice: 'process' });
        await context.beat(1100);

        const captions: BoardLine[] = [];
        const redrawPlace = async (): Promise<void> => {
            await drawPlace(context, state, 0, placePictureLayout(context));
            drawBoard(context, 'place-copy', placeStageLayout(context), placeLines(context, captions));
            await context.cut();
        };

        resize.setRedraw(redrawPlace);
        await context.clear();
        await context.beat(280);
        await drawPlace(context, state, 1100, placePictureLayout(context));

        await addPlaceLine(context, captions, 'i made you a place.', 'process');
        await context.beat(450);
        await addPlaceLine(
            context,
            captions,
            `this room is ${String(context.terminal.columns)} by ${String(context.terminal.rows)} cells.`,
            'system',
        );
        await context.beat(500);
        await addPlaceLine(context, captions, 'i have to keep drawing it.', 'process');
        await context.beat(450);
        await addPlaceLine(context, captions, 'you are still there.', 'process');
        await context.beat(1500);
        resize.dispose();
    });
}

function playLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 18, maxWidth: 62 });
}

function discoveryLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    return lines.map((line, index) => positionDiscoveryLine(context, line, index));
}

function positionDiscoveryLine(
    context: SceneContext,
    line: BoardLine,
    index: number,
): BoardLine {
    const rows = context.terminal.rows <= 16 ? [0, 2, 4, 11, 13] : [1, 3, 5, 13, 15];
    return { ...line, row: rows[index] ?? line.row };
}

function placeStageLayout(context: SceneContext): StageLayout {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    return stageLayout(context.terminal, { height: compact ? 16 : 22, maxWidth: 64 });
}

function placePictureLayout(context: SceneContext): StageLayout {
    const stage = placeStageLayout(context);
    const width = Math.min(stage.width, 62);

    return {
        ...stage,
        height: stage.compact ? 9 : 13,
        left: stage.left + Math.floor((stage.width - width) / 2),
        width,
    };
}

function placeLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    const rows = placeStageLayout(context).compact ? [10, 11, 13, 15] : [15, 17, 18, 20];

    return lines.map((line, index) => ({
        ...line,
        row: rows[Math.min(index, rows.length - 1)],
    }));
}

async function addPlaceLine(
    context: SceneContext,
    lines: BoardLine[],
    text: string,
    voice: string,
): Promise<void> {
    const row = placeLines(context, [...lines, { row: 0, text }]).at(-1)?.row ?? 0;

    await addBoardLine(context, 'place-copy', placeStageLayout(context), lines, {
        row,
        speed: voice === 'system' ? 0 : 42,
        text,
        voice,
    });
}
