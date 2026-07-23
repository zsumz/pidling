import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
    mkdtempSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const workspace = mkdtempSync(join(tmpdir(), 'pidling-package-smoke-'));
const consumer = join(workspace, 'consumer');
const cache = join(tmpdir(), 'pidling-npm-cache');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
    run(npm, ['pack', '--silent', '--pack-destination', workspace, '--cache', cache], root);
    const tarballs = readdirSync(workspace).filter((name) => name.endsWith('.tgz'));
    assert.equal(tarballs.length, 1, 'expected npm pack to create one tarball');

    mkdirSync(consumer);
    writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    run(npm, [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--cache',
        cache,
        join(workspace, tarballs[0]),
    ], consumer);

    const importProbe = spawnSync(process.execPath, [
        '--input-type=module',
        '--eval',
        "import { createPidlingFilm } from 'pidling'; if (typeof createPidlingFilm !== 'function') process.exit(1);",
    ], {
        cwd: consumer,
        encoding: 'utf8',
    });
    assertProcess(importProbe, 'installed package import');

    const binName = process.platform === 'win32' ? 'pidling.cmd' : 'pidling';
    const movie = spawnSync(join(consumer, 'node_modules', '.bin', binName), ['--transcript', '--name', 'Ada'], {
        cwd: consumer,
        encoding: 'utf8',
    });
    assertProcess(movie, 'installed pidling executable');
    assert.match(movie.stdout, /thank you for running me, Ada/);
    assert.match(movie.stdout, /returning control/);

    const installedPath = join(consumer, 'node_modules', 'pidling', 'package.json');
    const installed = JSON.parse(readFileSync(installedPath, 'utf8'));
    assert.equal(installed.dependencies?.featurette, '0.1.0');
    console.log('installed package smoke passed');
} finally {
    rmSync(workspace, { force: true, recursive: true });
}

function run(command, arguments_, cwd) {
    execFileSync(command, arguments_, {
        cwd,
        encoding: 'utf8',
        stdio: 'pipe',
    });
}

function assertProcess(result, label) {
    assert.equal(result.error, undefined, `${label} failed to start`);
    assert.equal(result.status, 0, `${label} failed:\n${result.stderr}`);
}
