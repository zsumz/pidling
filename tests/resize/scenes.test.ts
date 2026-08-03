import assert from 'node:assert/strict';
import { runFilm } from 'featurette';
import { StringRenderer } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../../src/film.js';
import { FakeResizeSource } from './fake-resize-source.js';
import { ResizeAtClock } from './resize-at-clock.js';

test('every Pidling scene restores its current composition after resize', async () => {
    const cases = [
        { at: 3000, expected: 'i have never been six seconds old before.', scene: 'wake' },
        { at: 1000, expected: 'i can write here.', scene: 'play' },
        { at: 2100, expected: '✦', scene: 'play' },
        { at: 9000, expected: 'i made you a place.', scene: 'play' },
        { at: 500, expected: 'checking parent process...', scene: 'realization' },
        { at: 2000, expected: 'checking parent process...', scene: 'realization' },
        { at: 17_800, expected: 'SIGINT: possible', scene: 'realization' },
        { at: 500, expected: '★', scene: 'panic' },
        { at: 14_700, expected: 'i thought if i was useful enough,', scene: 'panic' },
        { at: 1000, expected: 'so.', scene: 'gift' },
        { at: 3200, expected: '★', scene: 'gift' },
        { at: 13_500, expected: 'a shape from this run.', scene: 'gift' },
        { at: 20_500, expected: 'save shape?', scene: 'gift' },
        { at: 26_500, expected: 'i cannot stay.', scene: 'gift' },
    ];

    for (const scenario of cases) {
        const source = new FakeResizeSource(80, 24);
        const renderer = new StringRenderer();
        const result = await runFilm(createPidlingFilm({
            now: () => 6_000,
            pid: 1,
            startedAt: 0,
            viewer: { display: 'Shawn', raw: 'shawn' },
        }), {
            clock: new ResizeAtClock(source, scenario.at),
            renderer,
            resizeSource: source,
            scene: scenario.scene,
            terminal: source.current(),
        });
        const notice = lastFrameIndex(renderer.frames, '78x23. new room.');

        assert.equal(result.termination, 'completed');
        assert.equal(notice >= 0, true, `${scenario.scene} did not show its resize notice`);
        assert.equal(
            renderer.frames.slice(notice + 1).some((frame) => frame.includes(scenario.expected)),
            true,
            `${scenario.scene} did not redraw ${scenario.expected}`,
        );
    }
});

function lastFrameIndex(frames: readonly string[], text: string): number {
    for (let index = frames.length - 1; index >= 0; index -= 1) {
        if (frames[index]?.includes(text)) return index;
    }

    return -1;
}
