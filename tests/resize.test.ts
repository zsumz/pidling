import assert from 'node:assert/strict';
import {
    defineFilm,
    runFilm,
    type Clock,
    type TerminalInfo,
    type TerminalResizeSource,
} from 'featurette';
import { FakeClock, StringRenderer } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../src/film.js';
import { directResize } from '../src/stage/resize.js';

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

test('every Pidling scene restores its current composition after resize', async () => {
    const cases = [
        { at: 3000, expected: 'i have never been six seconds old before.', scene: 'wake' },
        { at: 1000, expected: 'i can write here.', scene: 'play' },
        { at: 9000, expected: 'i made you a place.', scene: 'play' },
        { at: 1000, expected: 'checking parent process...', scene: 'realization' },
        { at: 500, expected: 'i can draw faster.', scene: 'panic' },
        { at: 1000, expected: 'so.', scene: 'gift' },
    ];

    for (const scenario of cases) {
        const source = new FakeResizeSource(80, 24);
        const renderer = new StringRenderer();
        const result = await runFilm(createPidlingFilm({
            now: () => 6_000,
            pid: 1,
            startedAt: 0,
            viewer: { display: 'Shawn', raw: 'shawn' },
        }), {
            clock: new ResizeAtClock(source, scenario.at),
            renderer,
            resizeSource: source,
            scene: scenario.scene,
            terminal: source.current(),
        });
        const notice = lastFrameIndex(renderer.frames, '78x23. new room.');

        assert.equal(result.termination, 'completed');
        assert.equal(notice >= 0, true, `${scenario.scene} did not show its resize notice`);
        assert.equal(
            renderer.frames.slice(notice + 1).some((frame) => frame.includes(scenario.expected)),
            true,
            `${scenario.scene} did not redraw ${scenario.expected}`,
        );
    }
});

class ResizeAtClock implements Clock {
    private elapsed = 0;
    private resized = false;

    constructor(
        private readonly source: FakeResizeSource,
        private readonly resizeAt: number,
    ) {}

    public now(): number {
        return this.elapsed;
    }

    public async wait(ms: number): Promise<void> {
        this.elapsed += ms;

        if (!this.resized && this.elapsed >= this.resizeAt) {
            this.resized = true;
            this.source.resize(78, 23);
            await new Promise<void>((resolve) => {
                setImmediate(resolve);
            });
        }
    }
}

function lastFrameIndex(frames: readonly string[], text: string): number {
    for (let index = frames.length - 1; index >= 0; index -= 1) {
        if (frames[index]?.includes(text)) return index;
    }

    return -1;
}

class FakeResizeSource implements TerminalResizeSource {
    private handler?: () => void;
    private terminal: TerminalInfo;

    constructor(columns: number, rows: number) {
        this.terminal = { colorDepth: 24, columns, isTTY: true, rows, unicode: true };
    }

    public current(): TerminalInfo {
        return { ...this.terminal };
    }

    public onResize(handler: () => void): () => void {
        this.handler = handler;
        return () => {
            this.handler = undefined;
        };
    }

    public resize(columns: number, rows: number): void {
        this.terminal = { ...this.terminal, columns, rows };
        this.handler?.();
    }
}
