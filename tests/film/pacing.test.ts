import assert from 'node:assert/strict';
import { renderAt, renderFilm, renderScene } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../../src/film.js';

const viewer = { display: 'Shawn', raw: 'shawn' };

test('the full-motion cut leaves room between story beats', async () => {
    const film = createPidlingFilm({ now: () => 6_000, pid: 1, startedAt: 0, viewer });
    const result = await renderFilm(film, {
        reducedMotion: false,
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.elapsed >= 108_000, true);
    assert.equal(result.elapsed < 116_000, true);
});

test('bargaining accelerates before the confession slows down', async () => {
    const rendered = await renderScene(createPidlingFilm({
        now: () => 6_000,
        pid: 1,
        startedAt: 0,
        viewer,
    }), 'panic', {
        reducedMotion: false,
        terminal: { columns: 80, rows: 24 },
    });
    const faster = rendered.frameRecords.find(({ text }) => text.includes('i can draw faster.'));
    const better = rendered.frameRecords.find(({ text }) => text.includes('i can make better stars.'));
    const important = rendered.frameRecords.find(({ text }) => text.includes('i can print something important.'));
    const saveStarted = rendered.frameRecords.find(({ text }) => text.includes('saving process'));
    const saveFailed = rendered.frameRecords.find(({ text }) => text.includes('save process: unavailable'));
    const useful = rendered.frameRecords.find(({ text }) => text.includes('i thought if i was useful enough,'));
    const running = rendered.frameRecords.find(({ text }) => text.includes('you would keep me running.'));

    assert.ok(faster);
    assert.ok(better);
    assert.ok(important);
    assert.ok(saveStarted);
    assert.ok(saveFailed);
    assert.ok(useful);
    assert.ok(running);
    assert.equal(better.elapsed - faster.elapsed < running.elapsed - useful.elapsed, true);
    assert.equal(saveFailed.elapsed - saveStarted.elapsed >= 2_500, true);
    assert.equal(
        rendered.frameRecords
            .filter(({ elapsed }) => elapsed > better.elapsed && elapsed < important.elapsed)
            .every(({ text }) => text.trim().length > 0),
        true,
    );
});

test('the final exit condition remains on screen before panic begins', async () => {
    const options = { now: () => 6_000, pid: 1, startedAt: 0, viewer };
    const rendered = await renderScene(createPidlingFilm(options), 'realization', {
        terminal: { columns: 80, rows: 24 },
    });
    const finalSignal = [...rendered.frameRecords].reverse().find(({ text }) => text.includes('exit: inevitable'));

    assert.notEqual(finalSignal, undefined);
    assert.equal(rendered.elapsed - (finalSignal?.elapsed ?? rendered.elapsed) >= 1900, true);

    const held = await renderAt(createPidlingFilm(options), {
        scene: 'realization',
        terminal: { columns: 80, rows: 24 },
        time: (finalSignal?.elapsed ?? 0) + 1500,
    });

    assert.match(held.toString(), /exit: inevitable/);
});

test('the realization gives all processes end its own frame', async () => {
    const rendered = await renderScene(createPidlingFilm({
        now: () => 6_000,
        pid: 1,
        startedAt: 0,
        viewer,
    }), 'realization', {
        terminal: { columns: 80, rows: 24 },
    });
    const mortality = rendered.frameRecords.find(({ text }) => text.includes('all processes end.'));

    assert.notEqual(mortality, undefined);
    assert.doesNotMatch(mortality?.text ?? '', /checking (parent process|signal handlers|exit conditions)/);
});
