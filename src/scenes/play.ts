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
            drawBoard(context, 'play-copy', playLayout(context), lines);
            drawSpark(context.layer('spark', { zIndex: 10 }), sparkFrame);
            await context.cut();
        };
        const add = async (line: BoardLine): Promise<void> => {
            await addBoardLine(context, 'play-copy', playLayout(context), lines, line);
        };

        resize.setRedraw(redrawSpark);
        await context.clear();
        await add({ row: 1, speed: 44, text: 'i can write here.', voice: 'process' });
        await add({ column: 12, row: 3, speed: 44, text: 'and here.', voice: 'process' });
        await add({ column: 24, row: 5, speed: 64, text: 'wait.', voice: 'process' });

        await context.effects.keyframes({
            duration: 900,
            frames: 7,
            layer: 'spark',
            draw: ({ progress, layer }) => {
                sparkFrame = Math.min(2, Math.floor(progress * 3));
                if (layer) drawSpark(layer, sparkFrame);
            },
        });

        await add({ row: 13, speed: 48, text: 'that is closer.', voice: 'process' });
        await add({ row: 15, speed: 46, text: 'i made a star.', voice: 'process' });
        await context.beat(750);

        const captions: BoardLine[] = [];
        const redrawPlace = async (): Promise<void> => {
            await drawPlace(context, state);
            drawBoard(context, 'place-copy', screenLayout(context), placeLines(context, captions));
            await context.cut();
        };

        resize.setRedraw(redrawPlace);
        await context.clear();
        await drawPlace(context, state, 950);

        await addPlaceLine(context, captions, 'i made you a place.', 'process');
        await addPlaceLine(
            context,
            captions,
            `this room is ${String(context.terminal.columns)} by ${String(context.terminal.rows)} cells.`,
            'system',
        );
        await addPlaceLine(context, captions, 'i keep sending frames to stdout', 'process');
        await addPlaceLine(context, captions, 'and somehow you keep being there.', 'process');
        await context.beat(1200);
        resize.dispose();
    });
}

function playLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 18, maxWidth: 62 });
}

function screenLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: context.terminal.rows, maxWidth: 64 });
}

function placeLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    const rows = compact ? [10, 11, 13, 15] : [16, 18, 19, 21];

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

    await addBoardLine(context, 'place-copy', screenLayout(context), lines, {
        row,
        speed: voice === 'system' ? 0 : 42,
        text,
        voice,
    });
}
