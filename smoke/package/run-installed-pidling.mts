import { expect, type NpmFixture, type SmokeContext } from 'smoque';

export async function runInstalledPidling(
    t: SmokeContext,
    fixture: NpmFixture,
): Promise<void> {
    await t.step('installed package exposes its public entrypoint and types', async () => {
        const pkg = fixture.package('pidling');
        await pkg.toExposeOnly(['.']);
        await pkg.toHaveTypes(['.']);
        await expect.file(fixture.path('node_modules', 'pidling', 'package.json'))
            .jsonPath('$.dependencies.featurette')
            .toBe('0.1.0');
    });

    await t.step('installed package imports in an ESM project', async () => {
        await fixture.node.inline(`
            import { createPidlingFilm } from 'pidling';
            import * as pidling from 'pidling';
            if (typeof createPidlingFilm !== 'function') {
                throw new Error('createPidlingFilm is not available');
            }
            if (JSON.stringify(Object.keys(pidling).sort()) !== '["createPidlingFilm"]') {
                throw new Error('pidling exposes an unexpected runtime export');
            }
        `);
    });

    await t.step('installed executable plays the complete transcript', async () => {
        const bin = process.platform === 'win32' ? 'pidling.cmd' : 'pidling';
        const result = await t.cmd(
            fixture.path('node_modules', '.bin', bin),
            ['--transcript', '--name', 'Ada'],
            { cwd: fixture.path(), timeout: '3m' },
        );

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('thank you for running me, Ada');
        expect(result.stdout).toContain('returning control');
    });
}
