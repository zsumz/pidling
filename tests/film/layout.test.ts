import assert from 'node:assert/strict';
import { renderFilm, renderScene } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../../src/film.js';

test('the visual scenes remain legible in the minimum room', async () => {
    const film = createPidlingFilm({
        now: () => 1_006_000,
        pid: 12345,
        startedAt: 1_000_000,
        viewer: { display: 'Shawn', raw: 'shawn' },
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
    const panic = await renderScene(film, 'panic', {
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
    assertBreathingRoomAroundStar(discovery ?? '');
    assert.equal(play.frames.some((frame) => frame.includes('i made a star.')
        && frame.includes('✦')
        && !frame.includes('★')), true);
    assert.equal(gift.result.termination, 'completed');
    assert.equal(gift.frames.some((frame) => frame.includes('run:2345')), true);
    assert.equal(gift.frames.some((frame) => frame.includes('Shawn')), true);
    assert.match(gift.lastFrame, /returning control/);
    assert.doesNotMatch(gift.lastFrame, /^\s*\$\s*$/m);
    assert.equal(realization.frames.some((frame) => frame.includes('┌────────────┐')), true);
    const collapsedRoom = [...realization.frames].reverse().find((frame) => frame.includes('not finished'));
    assert.match(collapsedRoom ?? '', /┌─+/);
    assert.doesNotMatch(realization.transcript, /\bstdout\b/i);
    assert.equal(panic.frames.some((frame) => /[╲╱]/.test(frame) && frame.includes('★')), true);
    assert.match(panic.transcript, /save process: unavailable/);
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

function assertBreathingRoomAroundStar(frame: string): void {
    const rows = frame.split('\n');
    const waitRow = rows.findIndex((row) => row.includes('wait.'));
    const firstHaloRow = rows.findIndex((row) => row.includes('·'));
    const lastHaloRow = rows.length - 1 - [...rows].reverse().findIndex((row) => row.includes('·'));
    const closerRow = rows.findIndex((row) => row.includes('that is closer.'));

    assert.equal(firstHaloRow - waitRow >= 2, true);
    assert.equal(closerRow - lastHaloRow >= 2, true);
}
