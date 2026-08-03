import assert from 'node:assert/strict';
import { createScreen, frameToString } from 'featurette';
import { test } from 'vitest';
import { drawBargainingStar } from '../../src/stage/bargaining.js';

const layout = { compact: true, height: 14, left: 2, top: 1, width: 44 };

test('bargaining overdraws the original star without losing it', () => {
    const screen = createScreen({ columns: 48, rows: 16 });
    const layer = screen.layer('panic');

    drawBargainingStar(layer, layout, 1);
    const frame = frameToString(screen.compose());
    assert.match(frame, /★/);
    assert.match(frame, /[╲╱]/);
    assert.match(frame, /─{4,}/);

    drawBargainingStar(layer, layout, 1, false);
    const ascii = frameToString(screen.compose());
    assert.match(ascii, /\*/);
    assert.match(ascii, /[\\/]/);
    assert.match(ascii, /-{4,}/);
});

test('bargaining keeps the star visible during its early pulse', () => {
    const screen = createScreen({ columns: 48, rows: 16 });
    const layer = screen.layer('panic');

    for (const progress of [0, 0.1, 0.2, 0.3]) {
        drawBargainingStar(layer, layout, progress);
        assert.match(frameToString(screen.compose()), /★/);
    }
});

test('bargaining distortion only builds outward', () => {
    const screen = createScreen({ columns: 48, rows: 16 });
    const layer = screen.layer('panic');
    const lineCounts = [0.15, 0.3, 0.5, 0.7, 1].map((progress) => {
        drawBargainingStar(layer, layout, progress);
        return frameToString(screen.compose()).match(/[─│╲╱]/g)?.length ?? 0;
    });

    assert.deepEqual(lineCounts, [...lineCounts].sort((left, right) => left - right));
    assert.equal(new Set(lineCounts).size, lineCounts.length);
});
