import assert from 'node:assert/strict';
import {
    defineFilm,
    InputController,
    runFilm,
    type Clock,
} from 'featurette';
import { FakeClock, StringRenderer } from 'featurette/test';
import { test } from 'vitest';
import { createPidlingFilm } from '../src/film.js';
import { playInterruptedEnding } from '../src/scenes/interrupt.js';
import { createStoryState } from '../src/story/state.js';

test('the first interrupt finishes its sentence before stopping playback', async () => {
    const input = new InputController();
    const renderer = new StringRenderer();
    const film = createPidlingFilm({
        now: () => 5_000,
        pid: 1,
        startedAt: 0,
        viewer: { display: 'Ada', raw: 'ada' },
    });

    film.scene('interrupt-probe', async () => {
        await input.emitCtrlC();
    });

    const result = await runFilm(film, {
        clock: new FakeClock(),
        input,
        renderer,
        scene: 'interrupt-probe',
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.termination, 'interrupted');
    assert.deepEqual(result.scenesPlayed, []);
    assert.match(renderer.transcriptText(), /let me finish this sentence/);
    assert.match(renderer.transcriptText(), /thank you for giving me this much time, Ada/);
    assert.match(renderer.transcriptText(), /time alive: 00:00:05/);
});

test('the interrupt ending owns the screen while the active scene is suspended', async () => {
    const input = new InputController();
    const renderer = new StringRenderer();
    const clock = new GatedClock();
    const state = createStoryState({ now: () => 5_000, pid: 1, startedAt: 0 });
    const film = defineFilm({ title: 'Interrupt Handoff' });

    film.onInterrupt(async (context) => {
        await playInterruptedEnding(context, state);
        context.quit();
    });
    film.scene('typing', async (context) => {
        context.draw.text(0, 2, 'old scene');
        await context.cut();
        await context.type('still typing', { at: { x: 0, y: 3 }, speed: 10 });
    });

    const playback = runFilm(film, {
        clock,
        input,
        renderer,
        terminal: { columns: 80, rows: 24 },
    });

    await flushPromises();
    const interruption = input.emitCtrlC();
    await flushPromises();
    clock.release(0);
    await flushPromises();

    assert.doesNotMatch(renderer.lastFrame(), /old scene|still typing/);

    clock.release(1);
    await interruption;
    const result = await playback;

    assert.equal(result.termination, 'interrupted');
    assert.match(renderer.lastFrame(), /returning control/);
    assert.doesNotMatch(renderer.lastFrame(), /old scene|still typing/);
});

class GatedClock implements Clock {
    private elapsed = 0;
    private readonly releases: Array<(() => void) | undefined> = [];
    private waits = 0;

    public now(): number {
        return this.elapsed;
    }

    public async wait(ms: number): Promise<void> {
        this.elapsed += ms;
        const wait = this.waits;
        this.waits += 1;

        if (wait > 1) {
            return;
        }

        await new Promise<void>((resolve) => {
            this.releases[wait] = resolve;
        });
    }

    public release(wait: number): void {
        this.releases[wait]?.();
    }
}

async function flushPromises(): Promise<void> {
    await new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
}
