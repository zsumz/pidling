import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderFilm } from 'featurette/test';
import { test } from 'vitest';
import { cleanViewerName, createPidlingFilm } from '../dist/index.js';

interface PackageManifest {
    dependencies?: Record<string, string>;
    private?: boolean;
    publishConfig?: { access?: string };
    version?: string;
}

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as PackageManifest;

test('the package manifest is ready for a public release', () => {
    assert.equal(manifest.version, '0.1.0');
    assert.notEqual(manifest.private, true);
    assert.equal(manifest.publishConfig?.access, 'public');
    assert.equal(manifest.dependencies?.featurette, '0.1.0');
});

test('the built package entry creates a complete film', async () => {
    const viewer = cleanViewerName('ada');
    const film = createPidlingFilm({
        now: () => 2_000,
        pid: 7,
        startedAt: 0,
        viewer,
    });
    const result = await renderFilm(film, {
        terminal: { columns: 80, rows: 24 },
    });

    assert.equal(result.result.termination, 'completed');
    assert.match(result.transcript, /thank you for running me, Ada/);
});
