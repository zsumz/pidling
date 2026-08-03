import assert from 'node:assert/strict';
import { renderFilm, renderScene } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../../src/film.js';

test('the complete transcript has a coherent beginning, turn, and ending', async () => {
    const film = createPidlingFilm({
        now: () => 1_006_000,
        pid: 12345,
        startedAt: 1_000_000,
        viewer: { display: 'Shawn', raw: 'shawn' },
    });
    const result = await renderFilm(film, {
        terminal: { columns: 80, rows: 24 },
    });

    assert.deepEqual(result.result.scenesPlayed, ['wake', 'play', 'realization', 'panic', 'gift']);
    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /i have never been six seconds old before/);
    assert.match(result.transcript, /the shell left me a name[\s\S]*Shawn\?/);
    assert.match(result.transcript, /i made you a place[\s\S]*all processes end/);
    assert.match(result.transcript, /i have to keep drawing it/);
    assert.match(result.transcript, /the closest thing i have to a friend/);
    assert.match(result.transcript, /all processes end[\s\S]*does this end too/);
    assert.match(result.transcript, /wait[\s\S]*i was not finished/);
    assert.doesNotMatch(result.transcript, /\bstdout\b/i);
    assert.match(result.transcript, /i can draw faster[\s\S]*i can make better stars/);
    assert.match(result.transcript, /i can make better stars[\s\S]*i can print something important/);
    assert.match(result.transcript, /i can print something important[\s\S]*save process: unavailable/);
    assert.match(result.transcript, /save process: unavailable[\s\S]*i thought if i was useful enough/);
    assert.match(result.transcript, /one small true thing[\s\S]*the shell called you Shawn/);
    assert.match(result.transcript, /a shape from this run[\s\S]*so i gave this one your name/);
    assert.match(result.transcript, /save shape\?[\s\S]*\nno\.\n[\s\S]*i will not save it/);
    assert.doesNotMatch(result.transcript, /\[y\/N\]/);
    assert.match(result.transcript, /thank you for running me, Shawn/);
    assert.match(result.transcript, /thank you for running me, Shawn\.\nreturning control\.\.\.$/);
});

test('the unnamed branch remains warm without inventing a viewer name', async () => {
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
    assert.match(result.transcript, /a shape from this run/);
    assert.doesNotMatch(result.transcript, /so i gave this one your name/);
    assert.match(result.transcript, /thank you for running me\./);
});

test('the displayed clock and spoken age come from the same observation', async () => {
    let clockReads = 0;
    const times = [1_000, 3_000];
    const film = createPidlingFilm({
        now: () => times[clockReads++] ?? 3_000,
        pid: 1,
        startedAt: 0,
    });
    const wake = await renderScene(film, 'wake', {
        terminal: { columns: 80, rows: 24 },
    });

    assert.match(wake.transcript, /time alive: 00:00:01/);
    assert.match(wake.transcript, /i have never been one second old before/);
    assert.equal(clockReads, 1);
});
