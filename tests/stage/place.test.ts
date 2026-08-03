import assert from 'node:assert/strict';
import { createScreen, frameToString, type TerminalInfo } from 'featurette';
import { test } from 'vitest';
import { drawPlaceFrame } from '../../src/stage/place.js';

test('the place keeps a sparse sky above a grounded bench', () => {
    const screen = createScreen({ columns: 66, rows: 15 });
    const layer = screen.layer('place');
    const layout = { compact: false, height: 13, left: 2, top: 1, width: 62 };

    drawPlaceFrame(layer, terminalInfo(), 123, layout);
    const rows = frameToString(screen.compose()).split('\n');
    const lowerRoom = rows.slice(
        layout.top + layout.height - 5,
        layout.top + layout.height - 1,
    ).join('\n');

    assert.equal(rows.join('\n').match(/✦/g)?.length, 2);
    assert.doesNotMatch(lowerRoom, /[·✦]/);
    assert.match(rows[layout.top + layout.height - 2] ?? '', /─{40,}/);

    drawPlaceFrame(layer, terminalInfo(), 123, layout, 0, 1);
    assert.equal(frameToString(screen.compose()).match(/[·✦]/g)?.length, 6);

    drawPlaceFrame(layer, terminalInfo(), 123, layout, 1);
    const collapsedRows = frameToString(screen.compose()).split('\n');
    assert.doesNotMatch(collapsedRows[layout.top + layout.height - 2] ?? '', /─{40,}/);
});

function terminalInfo(): TerminalInfo {
    return { colorDepth: 24, columns: 66, isTTY: true, rows: 15, unicode: true };
}
