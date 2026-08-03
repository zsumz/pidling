import assert from 'node:assert/strict';
import { test } from 'vitest';
import { findImportCycles } from '../../scripts/architecture/source/import-cycles.mts';

test('accepts an acyclic source graph', () => {
    assert.deepEqual(findImportCycles([
        { path: 'src/film.ts', imports: ['src/scenes/play.ts'] },
        { path: 'src/scenes/play.ts', imports: ['src/story/state.ts'] },
        { path: 'src/story/state.ts', imports: [] },
    ]), []);
});

test('reports a cycle once from its first canonical module', () => {
    assert.deepEqual(findImportCycles([
        { path: 'src/story/z.ts', imports: ['src/story/a.ts'] },
        { path: 'src/story/a.ts', imports: ['src/story/z.ts'] },
    ]), [
        'src/story/a.ts -> src/story/z.ts -> src/story/a.ts',
    ]);
});
