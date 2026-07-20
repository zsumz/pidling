import type { FeaturetteFilm, SceneContext } from 'featurette';
import { drawCorruption } from '../stage/corruption.js';
import { stageLayout, type StageLayout } from '../stage/layout.js';
import { drawPlace } from '../stage/place.js';
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

        for (const [index, text] of [
            'checking parent process...',
            'checking signal handlers...',
            'checking exit conditions...',
        ].entries()) {
            await add({ row: 3 + index * 2, speed: 22, text, voice: 'system' });
            await context.beat(320);
        }

        await add({ row: 11, speed: 66, text: 'all processes end.', voice: 'process' });
        await context.beat(1200);

        const redrawPlace = async (): Promise<void> => drawPlace(context, state);
        resize.setRedraw(redrawPlace);
        await context.clear();
        await redrawPlace();
        await context.beat(550);
        await context.effects.glitch({ duration: 450, intensity: 0.28 });

        let corruptFrame = 0;
        const corruptCopy: BoardLine[] = [];
        const redrawCorruption = async (): Promise<void> => {
            drawCorruption(context.layer('corruption', { zIndex: 5 }), context.terminal, corruptFrame);
            drawBoard(context, 'corruption-copy', screenLayout(context), corruptionLines(context, corruptCopy));
            await context.cut();
        };

        resize.setRedraw(redrawCorruption);
        await context.clear();

        for (corruptFrame = 0; corruptFrame < 5; corruptFrame += 1) {
            await redrawCorruption();
            await context.beat(260);
        }

        await addCorruptionLine(context, corruptCopy, 'wait.', 'process');
        await addCorruptionLine(context, corruptCopy, 'the sky is turning back into stdout.', 'process');
        await context.beat(700);

        lines.length = 0;
        resize.setRedraw(redrawText);
        await context.clear();

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
            await context.beat(360);
        }

        resize.dispose();
    });
}

function textLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 14, maxWidth: 62 });
}

function screenLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: context.terminal.rows, maxWidth: 62 });
}

function corruptionLines(context: SceneContext, lines: BoardLine[]): BoardLine[] {
    const rows = context.terminal.rows < 20 ? [12, 14] : [16, 18];
    return lines.map((line, index) => ({
        ...line,
        row: rows[Math.min(index, rows.length - 1)],
    }));
}

async function addCorruptionLine(
    context: SceneContext,
    lines: BoardLine[],
    text: string,
    voice: string,
): Promise<void> {
    const row = corruptionLines(context, [...lines, { row: 0, text }]).at(-1)?.row ?? 0;

    await addBoardLine(context, 'corruption-copy', screenLayout(context), lines, {
        row,
        speed: 44,
        text,
        voice,
    });
}
