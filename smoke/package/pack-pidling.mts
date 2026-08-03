import type { PackedArtifact, SmokeContext } from 'smoque';

export async function packPidling(t: SmokeContext): Promise<PackedArtifact> {
    const work = await t.tempDir('pidling-package');
    const destination = work.path('packed');

    await t.step('required package tools are available', async () => {
        await t.tools.node({ minVersion: 22 });
        await t.tools.npm({ minVersion: 10 });
    });
    await t.fs.mkdir(destination);

    return await t.step('pack the release artifact', async () =>
        await t.npm.pack({
            cache: work.path('npm-cache'),
            cwd: t.repoRoot(),
            destination,
            scripts: 'allow',
        }));
}
