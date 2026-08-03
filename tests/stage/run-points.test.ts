import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createRunPoints } from '../../src/stage/constellation/run-points.js';

test('constellation points are ordered, bounded, and repeatable', () => {
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
