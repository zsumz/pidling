import assert from 'node:assert/strict';
import { createScreen, frameToString, type TerminalInfo } from 'featurette';
import { test } from 'vitest';
import {
    constellationPath,
    drawConstellation,
    type Constellation,
} from '../../src/stage/constellation.js';
import { createRunPoints } from '../../src/stage/constellation/run-points.js';

test('the final constellation reads as a star instead of a graph', () => {
    const screen = createScreen({ columns: 58, rows: 16 });
    const layer = screen.layer('constellation');
    const terminal = terminalInfo();
    const constellation = createConstellation();

    drawConstellation(layer, terminal, constellation);
    const frame = frameToString(screen.compose());
    const path = constellationPath(terminal, constellation);

    assert.match(frame, /★/);
    assert.match(frame, /✦/);
    assert.match(frame, /run:2345/);
    assert.doesNotMatch(frame, /-\+-/);
    assert.deepEqual(path[0], path.at(-1));
});

test('the constellation begins with the original star before revealing the gift', () => {
    const screen = createScreen({ columns: 58, rows: 16 });
    const layer = screen.layer('constellation');
    const terminal = terminalInfo();
    const constellation = createConstellation();

    drawConstellation(layer, terminal, constellation, { reveal: 0 });
    const origin = frameToString(screen.compose());
    assert.match(origin, /· {3}★ {3}·/);
    assert.doesNotMatch(origin, /Shawn|run:2345|✦/);

    drawConstellation(layer, terminal, constellation, { reveal: 0.5 });
    const partial = frameToString(screen.compose());
    assert.match(partial, /✦/);
    assert.doesNotMatch(partial, /Shawn|run:2345/);

    drawConstellation(layer, terminal, constellation, { reveal: 1 });
    const complete = frameToString(screen.compose());
    assert.match(complete, /Shawn/);
    assert.match(complete, /run:2345/);
    assert.match(complete, /✦/);
});

function createConstellation(): Constellation {
    return {
        label: 'Shawn',
        points: createRunPoints(123),
        runLabel: 'run:2345',
    };
}

function terminalInfo(): TerminalInfo {
    return { colorDepth: 24, columns: 58, isTTY: true, rows: 16, unicode: true };
}
