import assert from 'node:assert/strict';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

const cliPath = fileURLToPath(new URL('../dist/cli.js', import.meta.url));

test('the built CLI reports Pidling help', () => {
    const result = runCli('--help');

    assert.equal(result.status, 0);
    assert.match(result.stdout, /^pidling - a short film for the terminal/m);
    assert.match(result.stdout, /^ {2}pidling \[options\]$/m);
    assert.equal(result.stderr, '');
});

test('the built CLI reports invalid movie options without a crash dump', () => {
    const result = runCli('--name');

    assert.equal(result.status, 1);
    assert.match(result.stderr, /^pidling crashed: Error: --name requires a value\./);
});

test('the built CLI renders a named transcript and exits successfully', () => {
    const result = runCli('--transcript', '--name', 'Ada');

    assert.equal(result.status, 0);
    assert.match(result.stdout, /the shell left me a name[\s\S]*Ada\?/);
    assert.match(result.stdout, /a shape made from this run[\s\S]*so i gave this one your name/);
    assert.match(result.stdout, /time alive: one complete run/);
    assert.match(result.stdout, /thank you for running me, Ada/);
    assert.match(result.stdout, /returning control/);
    assert.equal(result.stderr, '');
});

function runCli(...arguments_: string[]): SpawnSyncReturns<string> {
    const result = spawnSync(process.execPath, [cliPath, ...arguments_], {
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' },
        timeout: 10_000,
    });

    assert.equal(result.error, undefined);
    return result;
}
