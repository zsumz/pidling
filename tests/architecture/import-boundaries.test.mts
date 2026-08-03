import assert from 'node:assert/strict';
import { test } from 'vitest';
import { inspectImportBoundaries } from '../../scripts/architecture/source/import-boundaries.mts';

test('allows each source layer to depend inward', () => {
    assert.deepEqual(inspectImportBoundaries([
        { path: 'src/story/state.ts', imports: ['src/story/time.ts'] },
        { path: 'src/stage/star.ts', imports: ['src/story/time.ts'] },
        { path: 'src/scenes/play.ts', imports: ['src/stage/star.ts', 'src/story/state.ts'] },
        { path: 'src/film.ts', imports: ['src/scenes/play.ts', 'src/story/state.ts'] },
        { path: 'src/cli.ts', imports: ['src/film.ts', 'src/runtime/viewer.ts'] },
        { path: 'src/index.ts', imports: ['src/film.ts', 'src/story/viewer.ts'] },
    ]), []);
});

test('rejects dependencies that point outward', () => {
    assert.deepEqual(inspectImportBoundaries([
        { path: 'src/story/state.ts', imports: ['src/runtime/viewer.ts'] },
        { path: 'src/stage/star.ts', imports: ['src/scenes/play.ts'] },
    ]), [
        'src/story/state.ts: story modules must not import runtime modules (src/runtime/viewer.ts)',
        'src/stage/star.ts: stage modules must not import scenes modules (src/scenes/play.ts)',
    ]);
});

test('requires every source module to have an owner', () => {
    assert.deepEqual(
        inspectImportBoundaries([{ path: 'src/mystery.ts', imports: [] }]),
        ['src/mystery.ts has no source layer ownership'],
    );
});
