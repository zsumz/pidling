import { access } from 'node:fs/promises';
import path from 'node:path';
import type { PackedArtifact, SmokeContext } from 'smoque';
import { npmPackResult } from './npm-pack-result.mts';

export async function packPidling(t: SmokeContext): Promise<PackedArtifact> {
    const work = await t.tempDir('pidling-package');
    const destination = work.path('packed');

    await t.step('required package tools are available', async () => {
        await t.tools.node({ minVersion: 22 });
        await t.tools.npm({ minVersion: 10 });
    });
    await t.fs.mkdir(destination);

    return await t.step('pack the release artifact', async () => {
        const result = await t.cmd('npm', ['pack', '--json', '--pack-destination', destination], {
            cwd: t.repoRoot(),
            env: { NPM_CONFIG_CACHE: work.path('npm-cache') },
        });
        const packed = npmPackResult(result.stdout, 'pidling');
        const artifactPath = path.join(destination, packed.filename);

        await access(artifactPath);

        return {
            filename: packed.filename,
            packageName: packed.name,
            path: artifactPath,
            version: packed.version,
        };
    });
}
