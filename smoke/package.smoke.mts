import { smoke } from 'smoque';
import { assertPidlingPackage } from './package/assert-pidling-package.mts';
import { installPidlingPackage } from './package/install-pidling-package.mts';
import { packPidling } from './package/pack-pidling.mts';
import { runInstalledPidling } from './package/run-installed-pidling.mts';

smoke.suite('pidling package installs and plays', { tags: ['package'] }, async (t) => {
    const tarball = await packPidling(t);

    await assertPidlingPackage(t, tarball);
    const fixture = await installPidlingPackage(t, tarball);
    await runInstalledPidling(t, fixture);
});
