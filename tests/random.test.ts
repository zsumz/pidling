import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createRandom, createRunPoints, hashText } from '../src/story/random.js';
import { createStoryState } from '../src/story/state.js';

test('hashes and pseudorandom sequences are deterministic and seed-sensitive', () => {
    assert.equal(hashText('pidling'), hashText('pidling'));
    assert.notEqual(hashText('pidling'), hashText('Pidling'));

    const first = createRandom(42);
    const second = createRandom(42);
    const third = createRandom(43);
    const firstSequence = Array.from({ length: 6 }, () => first());

    assert.deepEqual(firstSequence, Array.from({ length: 6 }, () => second()));
    assert.notDeepEqual(firstSequence, Array.from({ length: 6 }, () => third()));
    assert.equal(firstSequence.every((value) => value >= 0 && value < 1), true);
});

test('run points are ordered, bounded, and repeatable', () => {
    const points = createRunPoints(123, 8);

    assert.deepEqual(points, createRunPoints(123, 8));
    assert.notDeepEqual(points, createRunPoints(124, 8));
    assert.equal(points.length, 8);
    assert.equal(points[0]?.x, 0.08);
    assert.equal(Math.abs((points.at(-1)?.x ?? 0) - 0.92) < Number.EPSILON * 2, true);
    assert.equal(points.every((point) => point.x >= 0.08 && point.x <= 0.92), true);
    assert.equal(points.every((point) => point.y >= 0.12 && point.y < 0.88), true);
    assert.equal(points.every((point, index) => index === 0 || point.x > (points[index - 1]?.x ?? 0)), true);
});

test('story state samples its start once and derives a run-specific seed', () => {
    let clockReads = 0;
    const now = (): number => {
        clockReads += 1;
        return 5_000;
    };
    const first = createStoryState({ now, pid: 7, viewer: { display: 'Ada', raw: 'ada' } });
    const same = createStoryState({ now: () => 5_000, pid: 7, viewer: { display: 'Ada', raw: 'ada' } });
    const otherViewer = createStoryState({ now: () => 5_000, pid: 7, viewer: { display: 'Grace', raw: 'grace' } });

    assert.equal(clockReads, 1);
    assert.equal(first.startedAt, 5_000);
    assert.equal(first.runSeed, same.runSeed);
    assert.notEqual(first.runSeed, otherViewer.runSeed);
});
