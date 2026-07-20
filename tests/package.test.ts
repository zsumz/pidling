import assert from 'node:assert/strict';
import { renderFilm } from 'featurette/test';
import { test } from 'vitest';
import { cleanViewerName, createPidlingFilm } from '../dist/index.js';

test('the built package entry creates a complete film', async () => {
    const viewer = cleanViewerName('ada');
    const film = createPidlingFilm({
        now: () => 2_000,
        pid: 7,
        startedAt: 0,
        viewer,
    });
    const result = await renderFilm(film, {
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /thank you for running me, Ada/);
});
