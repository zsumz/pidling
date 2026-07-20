import assert from 'node:assert/strict';
import { defineFilm, FakeClock, InputController, runFilm, StringRenderer } from 'featurette';
import { test } from 'vitest';
import { playInterruptedEnding } from '../src/scenes/interrupt.js';
import { createStoryState } from '../src/story/state.js';

test('the first interrupt finishes its sentence before stopping playback', async () => {
    const input = new InputController();
    const renderer = new StringRenderer();
    const state = createStoryState({
        now: () => 5_000,
        pid: 1,
        startedAt: 0,
        viewer: { display: 'Ada', raw: 'ada' },
    });
    const film = defineFilm({ title: 'Interrupt Probe' });

    film.onInterrupt(async (context) => {
        await playInterruptedEnding(context, state);
        context.quit();
    });
    film.scene('running', async () => {
        await input.emitCtrlC();
    });

    const result = await runFilm(film, {
        clock: new FakeClock(),
        input,
        renderer,
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.termination, 'interrupted');
    assert.deepEqual(result.scenesPlayed, []);
    assert.match(renderer.transcriptText(), /let me finish this sentence/);
    assert.match(renderer.transcriptText(), /thank you for giving me this much time, Ada/);
    assert.match(renderer.transcriptText(), /time alive: 00:00:05/);
});
