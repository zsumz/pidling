import assert from 'node:assert/strict';
import { test } from 'vitest';
import { sourceImports } from '../../scripts/architecture/source/source-imports.mts';

test('finds relative imports and re-exports as source modules', () => {
    const source = [
        'import type { StoryState } from \'../story/state.js\';',
        'import { defineFilm } from \'featurette\';',
        'export { drawStar } from \'../stage/star.js\';',
    ].join('\n');

    assert.deepEqual(sourceImports('src/scenes/example.ts', source), [
        'src/stage/star.ts',
        'src/story/state.ts',
    ]);
});

test('normalizes TypeScript tooling imports', () => {
    assert.deepEqual(
        sourceImports('scripts/architecture/check.mts', 'import \'./source/check.mjs\';'),
        ['scripts/architecture/source/check.mts'],
    );
});
