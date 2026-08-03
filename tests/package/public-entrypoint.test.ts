import assert from 'node:assert/strict';
import { renderFilm } from 'featurette/test';
import { test } from 'vitest';
import {
    createPidlingFilm,
    type CreatePidlingOptions,
    type ViewerName,
} from '../../dist/index.js';
import * as pidling from '../../dist/index.js';

test('the public runtime surface contains only the film factory', () => {
    assert.deepEqual(Object.keys(pidling).sort(), ['createPidlingFilm']);
});

test('the built entrypoint creates a complete film', async () => {
    const viewer = { display: 'Ada', raw: 'ada' } satisfies ViewerName;
    const options = {
        now: () => 2_000,
        pid: 7,
        startedAt: 0,
        viewer,
    } satisfies CreatePidlingOptions;
    const result = await renderFilm(createPidlingFilm(options), {
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /thank you for running me, Ada/);
});
