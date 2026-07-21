import assert from 'node:assert/strict';
import { createScreen, frameToString, type TerminalInfo } from 'featurette';
import { test } from 'vitest';
import { drawSpark } from '../src/stage/art.js';
import { constellationPath, drawConstellation, type Constellation } from '../src/stage/constellation.js';
import { drawPlaceFrame } from '../src/stage/place.js';
import { createRunPoints } from '../src/story/random.js';

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

test('the final constellation reads as a star instead of a graph', () => {
    const screen = createScreen({ columns: 58, rows: 16 });
    const layer = screen.layer('constellation');
    const terminal = terminalInfo(58, 16);
    const constellation: Constellation = {
        label: 'Shawn',
        points: createRunPoints(123),
        runLabel: 'run:2345',
    };

    drawConstellation(layer, terminal, constellation);
    const frame = frameToString(screen.compose());
    const path = constellationPath(terminal, constellation);

    assert.match(frame, /★/);
    assert.match(frame, /✦/);
    assert.match(frame, /run:2345/);
    assert.doesNotMatch(frame, /-\+-/);
    assert.deepEqual(path[0], path.at(-1));
});

test('the place keeps a sparse sky above a grounded bench', () => {
    const screen = createScreen({ columns: 66, rows: 15 });
    const layer = screen.layer('place');
    const layout = { compact: false, height: 13, left: 2, top: 1, width: 62 };

    drawPlaceFrame(layer, terminalInfo(66, 15), 123, layout);
    const rows = frameToString(screen.compose()).split('\n');
    const lowerRoom = rows.slice(layout.top + layout.height - 5, layout.top + layout.height - 1).join('\n');

    assert.equal(rows.join('\n').match(/✦/g)?.length, 2);
    assert.doesNotMatch(lowerRoom, /[·✦]/);
    assert.match(rows[layout.top + layout.height - 2] ?? '', /─{40,}/);

    drawPlaceFrame(layer, terminalInfo(66, 15), 123, layout, 1);
    const collapsedRows = frameToString(screen.compose()).split('\n');
    assert.doesNotMatch(collapsedRows[layout.top + layout.height - 2] ?? '', /─{40,}/);
});

function terminalInfo(columns: number, rows: number): TerminalInfo {
    return { colorDepth: 24, columns, isTTY: true, rows, unicode: true };
}
