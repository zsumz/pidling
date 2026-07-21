import type { Layer, SceneContext, TerminalInfo } from 'featurette';
import { createRandom } from '../story/random.js';
import type { StoryState } from '../story/state.js';
import { stageLayout, type StageLayout } from './layout.js';

export async function drawPlace(
    context: SceneContext,
    state: StoryState,
    duration = 0,
    placement?: StageLayout,
): Promise<void> {
    const compact = context.terminal.columns < 72 || context.terminal.rows < 22;
    const layout = placement ?? stageLayout(context.terminal, { height: compact ? 9 : 13, maxWidth: 62 });
    drawPlaceFrame(
        context.layer('place', { zIndex: 0 }),
        context.terminal,
        state.runSeed,
        layout,
    );

    await context.cut();
    await context.beat(duration);
}

export function drawPlaceFrame(
    place: Layer,
    terminal: TerminalInfo,
    runSeed: number,
    layout: StageLayout,
    decay = 0,
): void {
    const random = createRandom(runSeed);
    const skyRows = Math.max(2, layout.height - 7);
    const skyWidth = Math.max(1, layout.width - 4);
    const starCount = Math.max(4, Math.min(9, Math.round(skyWidth * skyRows * 0.02)));
    const visibleStars = Math.round(starCount * Math.max(0, 1 - decay));
    const brightStars = new Set([
        Math.floor(starCount * 0.3),
        Math.floor(starCount * 0.72),
    ]);
    const unicode = terminal.unicode;

    place.clear();
    place.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: 'night', dim: true },
    });

    for (let index = 0; index < starCount; index += 1) {
        const x = layout.left + 2 + Math.floor((index + random()) / starCount * skyWidth);
        const y = layout.top + 1 + Math.floor(random() * skyRows);
        const bright = brightStars.has(index);

        if (index < visibleStars) {
            place.text(x, y, bright ? unicode ? '✦' : '*' : unicode ? '·' : '.', {
                bold: bright,
                dim: !bright,
                fg: bright ? 'memory' : 'system',
            });
        }
    }

    drawGround(place, layout, decay, unicode);

    const bench = benchFrame(decay, unicode);
    if (bench.length > 0) {
        place.frame(bench, { x: 'center', y: layout.top + layout.height - 5 }, { fg: 'system' });
    }
}

function drawGround(place: Layer, layout: StageLayout, decay: number, unicode: boolean): void {
    const interiorWidth = Math.max(0, layout.width - 2);
    const visibleWidth = Math.round(interiorWidth * Math.max(0, 1 - decay));

    if (visibleWidth === 0) return;

    const left = layout.left + 1 + Math.floor((interiorWidth - visibleWidth) / 2);
    place.text(left, layout.top + layout.height - 2, (unicode ? '─' : '-').repeat(visibleWidth), {
        dim: true,
        fg: 'night',
    });
}

function benchFrame(decay: number, unicode: boolean): string[] {
    const frames = unicode ? [
        ['┌────────────┐', '└─┬────────┬─┘', '  │        │'],
        ['┌────────────┐', '└─┬───────┬─┘', '  │       ·'],
        ['┌────────·', '└─┬────', '  │'],
        ['  ───·', '    ·'],
        [],
    ] : [
        ['+------------+', '+-+--------+-+', '  |        |'],
        ['+------------+', '+-+-------+-+', '  |       .'],
        ['+--------.', '+-+----', '  |'],
        ['  ---.', '    .'],
        [],
    ];
    const frame = Math.min(frames.length - 1, Math.floor(Math.max(0, decay) * frames.length));

    return frames[frame] ?? [];
}
