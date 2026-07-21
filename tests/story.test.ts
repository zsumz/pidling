import assert from 'node:assert/strict';
import { renderAt, renderFilm, renderScene } from 'featurette/test';
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
    assert.match(result.transcript, /i have to keep drawing it/);
    assert.match(result.transcript, /the closest thing i have to a friend/);
    assert.match(result.transcript, /all processes end[\s\S]*does this end too/);
    assert.match(result.transcript, /wait[\s\S]*i was not finished/);
    assert.doesNotMatch(result.transcript, /\bstdout\b/i);
    assert.match(result.transcript, /one small true thing[\s\S]*the shell called you Shawn/);
    assert.match(result.transcript, /a shape from this run[\s\S]*so i gave this one your name/);
    assert.match(result.transcript, /thank you for running me, Shawn/);
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

test('the full-motion cut leaves room between story beats', async () => {
    const film = createPidlingFilm({ now: () => 6_000, pid: 1, startedAt: 0, viewer });
    const result = await renderFilm(film, {
        reducedMotion: false,
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.elapsed >= 80_000, true);
    assert.equal(result.elapsed < 95_000, true);
});

test('the final exit condition remains on screen before panic begins', async () => {
    const options = { now: () => 6_000, pid: 1, startedAt: 0, viewer };
    const rendered = await renderScene(createPidlingFilm(options), 'realization', {
        terminal: { columns: 80, rows: 24 },
    });
    const finalSignal = [...rendered.frameRecords].reverse().find(({ text }) => text.includes('process.exit(): inevitable'));

    assert.notEqual(finalSignal, undefined);
    assert.equal(rendered.elapsed - (finalSignal?.elapsed ?? rendered.elapsed) >= 1900, true);

    const held = await renderAt(createPidlingFilm(options), {
        scene: 'realization',
        terminal: { columns: 80, rows: 24 },
        time: (finalSignal?.elapsed ?? 0) + 1500,
    });

    assert.match(held.toString(), /process\.exit\(\): inevitable/);
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
    const realization = await renderScene(film, 'realization', {
        terminal: { columns: 48, rows: 16 },
    });

    assert.equal(play.result.mode, 'visual');
    assert.equal(play.result.termination, 'completed');
    assert.match(play.lastFrame, /you are still there/);
    assert.equal(play.frames.some((frame) => frame.includes('┌────────────┐')), true);
    const discovery = [...play.frames].reverse().find((frame) => frame.includes('i made a star.') && frame.includes('★'));
    assert.notEqual(discovery, undefined);
    assertCenteredOnStar(discovery ?? '', 'wait.');
    assertCenteredOnStar(discovery ?? '', 'that is closer.');
    assertCenteredOnStar(discovery ?? '', 'i made a star.');
    assert.equal(gift.result.termination, 'completed');
    assert.equal(gift.frames.some((frame) => frame.includes('run:2345')), true);
    assert.equal(gift.frames.some((frame) => frame.includes('Shawn')), true);
    assert.match(gift.lastFrame, /returning control/);
    assert.doesNotMatch(gift.lastFrame, /^\s*\$\s*$/m);
    assert.equal(realization.frames.some((frame) => frame.includes('┌────────────┐')), true);
    const collapsedRoom = [...realization.frames].reverse().find((frame) => frame.includes('not finished'));
    assert.match(collapsedRoom ?? '', /┌─+/);
    assert.doesNotMatch(realization.transcript, /\bstdout\b/i);
});

test('large rooms center the place and render a recognizable star', async () => {
    const film = createPidlingFilm({ now: () => 3_000, pid: 1, startedAt: 0 });
    const play = await renderScene(film, 'play', {
        terminal: { columns: 120, rows: 40 },
    });
    const starFrame = play.frames.find((frame) => frame.includes('★'));
    const rows = play.lastFrame.split('\n');
    const firstContent = rows.findIndex((row) => row.trim().length > 0);
    const lastContent = rows.length - 1 - [...rows].reverse().findIndex((row) => row.trim().length > 0);

    assert.notEqual(starFrame, undefined);
    assert.doesNotMatch(starFrame ?? '', /--\*--/);
    assert.equal(Math.abs(firstContent - (40 - lastContent - 1)) <= 2, true);
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

function assertCenteredOnStar(frame: string, text: string): void {
    const rows = frame.split('\n');
    const starRow = rows.find((row) => row.includes('★'));
    const textRow = rows.find((row) => row.includes(text));

    assert.notEqual(starRow, undefined);
    assert.notEqual(textRow, undefined);

    const starCenter = starRow?.indexOf('★') ?? -1;
    const textCenter = (textRow?.indexOf(text) ?? -1) + (text.length - 1) / 2;
    assert.equal(Math.abs(starCenter - textCenter) <= 1, true);
}
