import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createRandom } from '../../src/stage/random.js';

test('visual pseudorandom sequences are deterministic and seed-sensitive', () => {
    const first = createRandom(42);
    const second = createRandom(42);
    const third = createRandom(43);
    const firstSequence = Array.from({ length: 6 }, () => first());

    assert.deepEqual(firstSequence, Array.from({ length: 6 }, () => second()));
    assert.notDeepEqual(firstSequence, Array.from({ length: 6 }, () => third()));
    assert.equal(firstSequence.every((value) => value >= 0 && value < 1), true);
});
