import assert from 'node:assert/strict';
import { test } from 'vitest';
import { hashText } from '../../src/story/run-seed.js';
import { createStoryState } from '../../src/story/state.js';

test('story seeds are deterministic and text-sensitive', () => {
    assert.equal(hashText('pidling'), hashText('pidling'));
    assert.notEqual(hashText('pidling'), hashText('Pidling'));
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
