import assert from 'node:assert/strict';
import type { TerminalInfo } from 'featurette';
import { test } from 'vitest';
import { fitLabel, stageLayout, stageRow } from '../src/stage/layout.js';

test('stage layouts center full and compact rooms within their bounds', () => {
    assert.deepEqual(stageLayout(terminal(80, 24), { height: 12, maxWidth: 64 }), {
        compact: false,
        height: 12,
        left: 8,
        top: 6,
        width: 64,
    });
    assert.deepEqual(stageLayout(terminal(48, 16), { height: 18, maxWidth: 64 }), {
        compact: true,
        height: 16,
        left: 2,
        top: 0,
        width: 44,
    });
    assert.deepEqual(stageLayout(terminal(3, 2), { height: 8 }), {
        compact: true,
        height: 2,
        left: 1,
        top: 0,
        width: 1,
    });
});

test('stage rows clamp offsets to the visible layout', () => {
    const layout = stageLayout(terminal(80, 24), { height: 12 });

    assert.equal(stageRow(layout, -100), layout.top);
    assert.equal(stageRow(layout, 0), layout.top);
    assert.equal(stageRow(layout, 11), layout.top + 11);
    assert.equal(stageRow(layout, 100), layout.top + layout.height - 1);
});

test('labels fit exact, ellipsized, and extremely narrow widths', () => {
    assert.equal(fitLabel('pidling', 7), 'pidling');
    assert.equal(fitLabel('pidling', 6), 'pid...');
    assert.equal(fitLabel('pidling', 3), 'pid');
    assert.equal(fitLabel('pidling', 0), '');
});

function terminal(columns: number, rows: number): TerminalInfo {
    return { colorDepth: 24, columns, isTTY: true, rows, unicode: true };
}
