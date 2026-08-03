import { expect, type PackedArtifact, type SmokeContext } from 'smoque';

const expectedEntries = [
    'package/LICENSE',
    'package/README.md',
    'package/dist/cli.d.ts',
    'package/dist/cli.js',
    'package/dist/film.js',
    'package/dist/index.d.ts',
    'package/dist/index.js',
    'package/package.json',
    'package/pidling-logo.svg',
];

const forbiddenEntries = [
    'package/scripts/package-smoke.mts',
    'package/smoke/package.smoke.mts',
    'package/src/film.ts',
    'package/tests/package/public-entrypoint.test.ts',
    'package/eslint.config.mts',
    'package/tsdown.config.mts',
    'package/vitest.config.mts',
];

export async function assertPidlingPackage(
    t: SmokeContext,
    tarball: PackedArtifact,
): Promise<void> {
    await t.step('tarball contains only the public release surface', async () => {
        await expect.archive(tarball.path).toContainEntries(expectedEntries);
        await expect.archive(tarball.path).not.toContainEntries(forbiddenEntries);
    });
}
