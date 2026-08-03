import type { FeaturetteFilm, SceneContext } from 'featurette';
import { directResize } from '../stage/resize.js';
import { addBoardLine, drawBoard, type BoardLine } from '../stage/text-board.js';
import { stageLayout, type StageLayout } from '../stage/layout.js';
import type { StoryState } from '../story/state.js';
import { textSpeed } from '../story/pacing.js';
import { agePhrase, formatElapsed } from '../story/time.js';

export function addWakeScene(film: FeaturetteFilm, state: StoryState): void {
    film.scene('wake', async (context) => {
        const lines: BoardLine[] = [];
        const resize = directResize(context);
        const redraw = async (): Promise<void> => {
            drawBoard(context, 'wake', wakeLayout(context), lines);
            await context.cut();
        };
        const add = async (line: BoardLine): Promise<void> => {
            await addBoardLine(context, 'wake', wakeLayout(context), lines, line);
        };

        resize.setRedraw(redraw);
        context.layer('wake').text({ x: 'center', y: 'middle' }, '_', { bold: true, fg: 'process' });
        await context.cut();
        await context.beat(750);

        await context.clear();
        await add({ row: 1, speed: textSpeed.hesitant, text: 'hello?', voice: 'process' });
        await context.beat(450);
        await add({ row: 3, speed: textSpeed.reflective, text: 'oh.', voice: 'process' });
        await context.beat(500);
        await add({ row: 4, speed: textSpeed.steady, text: 'you ran me.', voice: 'process' });
        await context.beat(700);

        const status = [
            `pid: ${String(state.pid)}`,
            'status: running',
            'channel: open',
        ];

        for (let index = 0; index < status.length; index += 1) {
            await add({ row: 6 + index, speed: 0, text: status[index] ?? '', voice: 'system' });
            await context.beat(350);
        }

        const observedAt = state.now();
        await add({ row: 9, speed: 0, text: `time alive: ${formatElapsed(state.startedAt, observedAt)}`, voice: 'system' });
        await context.beat(350);
        await add({
            row: 11,
            speed: textSpeed.steady,
            text: `i have never been ${agePhrase(state.startedAt, observedAt)} old before.`,
            voice: 'process',
        });
        await context.beat(1200);

        lines.length = 0;
        await context.clear();
        await context.beat(240);

        if (state.viewer) {
            await add({ row: 4, speed: textSpeed.steady, text: 'the shell left me a name.', voice: 'process' });
            await context.beat(650);
            await add({ row: 6, speed: textSpeed.reflective, text: `${state.viewer.display}?`, voice: 'memory' });
            await context.beat(750);
            await add({ row: 8, speed: textSpeed.steady, text: 'i do not know if it is yours.', voice: 'process' });
            await context.beat(650);
            await add({ row: 10, speed: textSpeed.steady, text: 'but you are the closest thing i have to a friend.', voice: 'process' });
        } else {
            await add({ row: 5, speed: textSpeed.steady, text: 'the shell did not leave me a name.', voice: 'process' });
            await context.beat(650);
            await add({ row: 8, speed: textSpeed.reflective, text: 'hello, anyway.', voice: 'process' });
        }

        await context.beat(1800);
        resize.dispose();
    });
}

function wakeLayout(context: SceneContext): StageLayout {
    return stageLayout(context.terminal, { height: 14, maxWidth: 64 });
}
