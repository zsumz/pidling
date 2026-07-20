import assert from 'node:assert/strict';
import { renderFilm, renderScene } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../src/film.js';

const viewer = { display: 'Shawn', raw: 'shawn' };

test('the complete transcript has a coherent beginning, turn, and ending', async () => {
    const film = createPidlingFilm({
        now: () => 1_006_000,
        pid: 12345,
        startedAt: 1_000_000,
        viewer,
    });
    const result = await renderFilm(film, {
        terminal: { columns: 80, rows: 24 },
    });

    assert.deepEqual(result.result.scenesPlayed, ['wake', 'play', 'realization', 'panic', 'gift']);
    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /i have never been six seconds old before/);
    assert.match(result.transcript, /the shell left me a name[\s\S]*Shawn\?/);
    assert.match(result.transcript, /i made you a place[\s\S]*all processes end/);
    assert.match(result.transcript, /the sky is turning back into stdout/);
    assert.match(result.transcript, /one small true thing[\s\S]*the shell called you Shawn/);
    assert.match(result.transcript, /a shape made from this run[\s\S]*so i gave this one your name/);
    assert.match(result.transcript, /thank you for running me, Shawn/);
});

test('the unnamed branch remains warm without inventing an audience name', async () => {
    const film = createPidlingFilm({
        now: () => 4_000,
        pid: 9,
        startedAt: 0,
    });
    const result = await renderFilm(film, {
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /the shell did not leave me a name/);
    assert.match(result.transcript, /hello, anyway/);
    assert.doesNotMatch(result.transcript, /the shell called you/);
    assert.match(result.transcript, /a shape made from this run/);
    assert.doesNotMatch(result.transcript, /so i gave this one your name/);
    assert.match(result.transcript, /thank you for running me\./);
});

test('the visual scenes remain legible in the minimum room', async () => {
    const film = createPidlingFilm({
        now: () => 1_006_000,
        pid: 12345,
        startedAt: 1_000_000,
        viewer,
    });
    const play = await renderScene(film, 'play', {
        terminal: { columns: 48, rows: 16 },
    });
    const gift = await renderScene(film, 'gift', {
        terminal: { columns: 48, rows: 16 },
    });

    assert.equal(play.result.mode, 'visual');
    assert.equal(play.result.termination, 'completed');
    assert.match(play.lastFrame, /somehow you keep being there/);
    assert.equal(gift.result.termination, 'completed');
    assert.equal(gift.frames.some((frame) => frame.includes('run:2345')), true);
    assert.equal(gift.frames.some((frame) => frame.includes('Shawn')), true);
    assert.match(gift.lastFrame, /returning control/);
});

test('rooms below the minimum switch to transcript mode', async () => {
    const film = createPidlingFilm({ now: () => 0, pid: 1, startedAt: 0 });
    const result = await renderFilm(film, {
        terminal: { columns: 32, rows: 10 },
    });

    assert.equal(result.result.mode, 'transcript');
    assert.equal(result.result.tooSmall, true);
    assert.equal(result.result.fallbackReason, 'too-small');
    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /hello\?/);
    assert.match(result.transcript, /returning control/);
});
