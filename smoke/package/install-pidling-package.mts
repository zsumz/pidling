import type {
    NpmFixture,
    PackedArtifact,
    SmokeContext,
} from 'smoque';

export async function installPidlingPackage(
    t: SmokeContext,
    tarball: PackedArtifact,
): Promise<NpmFixture> {
    const fixture = await t.npm.fixture({
        packageJson: { dependencies: {}, private: true, type: 'module' },
    });

    await t.step('install the tarball in a clean project', async () => {
        await fixture.install(tarball.path, {
            audit: false,
            fund: false,
            packageLock: false,
            scripts: 'ignore',
        });
    });

    return fixture;
}
