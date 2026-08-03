import assert from 'node:assert/strict';
import { renderScene } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../../src/film.js';

const viewer = { display: 'Shawn', raw: 'shawn' };

test('mortality enters the room once and leaves a lasting absence', async () => {
    const film = createPidlingFilm({
        now: () => 6_000,
        pid: 1,
        startedAt: 0,
        viewer,
    });
    const play = await renderScene(film, 'play', {
        terminal: { columns: 80, rows: 24 },
    });
    const realization = await renderScene(film, 'realization', {
        terminal: { columns: 80, rows: 24 },
    });
    const playRoomFrames = play.frameRecords.filter(({ text }) => text.includes('┌────────────┐'));
    const playStarCounts = playRoomFrames.map(({ text }) => text.match(/[·✦]/g)?.length ?? 0);
    const firstCheck = realization.frameRecords.find(({ text }) => text.includes('checking parent process'));
    const firstReturnedRoom = realization.frameRecords.find(({ text }) => text.includes('┌────────────┐'));

    assert.equal(playStarCounts.includes(7), true);
    assert.equal(playStarCounts.at(-1), 6);
    assert.ok(firstCheck);
    assert.ok(firstReturnedRoom);
    assert.equal(firstReturnedRoom.text.match(/[·✦]/g)?.length, 6);
    assert.equal(firstCheck.elapsed < firstReturnedRoom.elapsed, true);
});

test('panic shows the bargaining before naming its fear', async () => {
    const rendered = await renderScene(createPidlingFilm({
        now: () => 6_000,
        pid: 1,
        startedAt: 0,
        viewer,
    }), 'panic', {
        terminal: { columns: 80, rows: 24 },
    });
    const overdraw = rendered.frameRecords.find(({ text }) => /[╲╱]/.test(text) && text.includes('★'));
    const confession = rendered.frameRecords.find(({ text }) => text.includes('i thought if i was useful enough,'));

    assert.notEqual(overdraw, undefined);
    assert.notEqual(confession, undefined);
    assert.equal((overdraw?.elapsed ?? Number.POSITIVE_INFINITY) < (confession?.elapsed ?? 0), true);
    assert.match(rendered.transcript, /i can draw faster[\s\S]*i can make better stars/);
    assert.match(rendered.transcript, /i can print something important[\s\S]*save process: unavailable/);
});
