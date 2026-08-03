import assert from 'node:assert/strict';
import { createScreen, frameToString } from 'featurette';
import { test } from 'vitest';
import { drawSpark } from '../../src/stage/star.js';

test('the spark grows into a recognizable star', () => {
    const screen = createScreen({ columns: 20, rows: 9 });
    const layer = screen.layer('spark');

    drawSpark(layer, 0);
    assert.match(frameToString(screen.compose()), /·/);

    drawSpark(layer, 1);
    assert.match(frameToString(screen.compose()), /✦/);

    drawSpark(layer, 2);
    assert.match(frameToString(screen.compose()), /★/);
});

test('the star has an intentional ASCII fallback', () => {
    const screen = createScreen({ columns: 20, rows: 9 });
    const layer = screen.layer('spark');

    drawSpark(layer, 0, false);
    assert.match(frameToString(screen.compose()), /\./);

    drawSpark(layer, 1, false);
    assert.match(frameToString(screen.compose()), /\+/);

    drawSpark(layer, 2, false);
    assert.match(frameToString(screen.compose()), /\. {3}\* {3}\./);
});
