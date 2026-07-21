import assert from 'node:assert/strict';
import { defineFilm } from 'featurette';
import { renderScene } from 'featurette/test';
import { test } from 'vitest';
import { drawBoard, type BoardLine } from '../src/stage/text-board.js';

test('board redraws preserve alignment and voice-style fallbacks', async () => {
    const film = defineFilm({ title: 'Board Probe' });
    const lines: BoardLine[] = [
        { row: 0, text: 'left', voice: 'process' },
        { row: 1, text: 'system', voice: 'system' },
        { align: 'center', row: 2, text: 'panic', voice: 'panic' },
        { align: 'right', row: 3, text: 'memory', voice: 'memory' },
        { column: 3, row: 4, style: { bold: true }, text: 'column' },
    ];

    film.scene('board', async (context) => {
        drawBoard(context, 'board', {
            compact: false,
            height: 5,
            left: 2,
            top: 1,
            width: 20,
        }, lines);
        await context.cut();
    });

    const result = await renderScene(film, 'board', {
        terminal: { columns: 30, rows: 8 },
    });
    const rows = result.lastFrame.split('\n');

    assert.equal(rows[1]?.indexOf('left'), 2);
    assert.equal(rows[2]?.indexOf('system'), 2);
    assert.equal(rows[3]?.indexOf('panic'), 9);
    assert.equal(rows[4]?.indexOf('memory'), 16);
    assert.equal(rows[5]?.indexOf('column'), 5);
});
