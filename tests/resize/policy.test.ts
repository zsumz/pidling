import assert from 'node:assert/strict';
import { defineFilm, runFilm } from 'featurette';
import { FakeClock, StringRenderer } from 'featurette/test';
import { test } from 'vitest';
import { directResize } from '../../src/stage/resize.js';
import { FakeResizeSource } from './fake-resize-source.js';

test('resize pauses for the wall line and redraws the current stage', async () => {
    const source = new FakeResizeSource(80, 24);
    const film = defineFilm({ title: 'Resize Probe' });
    const renderer = new StringRenderer();

    film.scene('room', async (context) => {
        const resize = directResize(context);
        resize.setRedraw(async () => {
            context.draw.text(0, 0, `redrawn ${String(context.terminal.columns)}x${String(context.terminal.rows)}`);
            await context.cut();
        });

        source.resize(64, 18);
        await context.beat(1);
        resize.dispose();
    });

    const result = await runFilm(film, {
        clock: new FakeClock(),
        renderer,
        resizeSource: source,
        terminal: source.current(),
    });

    assert.equal(result.terminal.columns, 64);
    assert.match(renderer.transcriptText(), /oh\. the walls moved/);
    assert.match(renderer.transcriptText(), /64x18\. new room/);
    assert.match(renderer.lastFrame(), /redrawn 64x18/);
});

test('a live shrink below the minimum switches playback to transcript mode', async () => {
    const source = new FakeResizeSource(80, 24);
    const film = defineFilm({
        minSize: { columns: 48, rows: 16 },
        title: 'Resize Policy Probe',
        tooSmall: 'transcript',
    });

    film.scene('room', async (context) => {
        source.resize(40, 12);
        await context.beat(1);
    });

    const result = await runFilm(film, {
        clock: new FakeClock(),
        renderer: new StringRenderer(),
        resizeSource: source,
        terminal: source.current(),
    });

    assert.equal(result.mode, 'transcript');
    assert.equal(result.fallbackReason, 'too-small');
    assert.equal(result.tooSmall, true);
});

test('a very small live resize uses the compact wall reaction', async () => {
    const source = new FakeResizeSource(80, 24);
    const film = defineFilm({ title: 'Tiny Resize Probe' });
    const renderer = new StringRenderer();

    film.scene('room', async (context) => {
        const resize = directResize(context);
        resize.setRedraw(async () => {
            context.draw.text(0, 0, 'still here');
            await context.cut();
        });

        source.resize(20, 7);
        await context.beat(1);
        resize.dispose();
    });

    const result = await runFilm(film, {
        clock: new FakeClock(),
        renderer,
        resizeSource: source,
        terminal: source.current(),
    });

    assert.equal(result.terminal.columns, 20);
    assert.equal(result.terminal.rows, 7);
    assert.match(renderer.transcriptText(), /oh\. walls moved/);
    assert.match(renderer.transcriptText(), /20x7\. holding on/);
    assert.match(renderer.lastFrame(), /still here/);
});

test('resize remains safe before a scene supplies its redraw callback', async () => {
    const source = new FakeResizeSource(80, 24);
    const film = defineFilm({ title: 'Early Resize Probe' });
    const renderer = new StringRenderer();

    film.scene('room', async (context) => {
        const resize = directResize(context);
        source.resize(70, 20);
        await context.beat(1);
        resize.dispose();
    });

    const result = await runFilm(film, {
        clock: new FakeClock(),
        renderer,
        resizeSource: source,
        terminal: source.current(),
    });

    assert.equal(result.termination, 'completed');
    assert.match(renderer.transcriptText(), /70x20\. new room/);
});
