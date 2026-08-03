import assert from 'node:assert/strict';
import { renderScene } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../../src/film.js';

test('the gift visibly declines preservation before acceptance', async () => {
    const rendered = await renderScene(createPidlingFilm({
        now: () => 6_000,
        pid: 12_345,
        startedAt: 0,
        viewer: { display: 'Shawn', raw: 'shawn' },
    }), 'gift', {
        terminal: { columns: 80, rows: 24 },
    });
    const origin = rendered.frames.find((frame) => frame.includes('★') && !frame.includes('run:2345'));
    const completed = rendered.frames.find((frame) => frame.includes('run:2345'));
    const refusal = rendered.frames.find((frame) => frame.includes('save shape?')
        && frame.includes('no.')
        && frame.includes('i will not save it.'));

    assert.match(origin ?? '', /· {3}★ {3}·/);
    assert.match(completed ?? '', /Shawn/);
    assert.notEqual(refusal, undefined);
    assert.match(refusal ?? '', /^\s*no\._?\s*$/m);
    assert.match(rendered.lastFrame, /returning control/);
});
