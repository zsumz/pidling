import assert from 'node:assert/strict';
import { test } from 'vitest';
import { parseCliOptions } from '../src/runtime/cli-options.js';

test('movie flags are consumed while Featurette flags retain their order', () => {
    const parsed = parseCliOptions([
        '--name',
        'Shawn',
        '--fast',
        '--scene',
        'gift',
        '--no-alt-screen',
    ]);

    assert.equal(parsed.name, 'Shawn');
    assert.deepEqual(parsed.featuretteArgv, [
        '--speed',
        '16',
        '--scene',
        'gift',
        '--no-alt-screen',
    ]);
});

test('inline names, help, and name opt-out remain local to Pidling', () => {
    const parsed = parseCliOptions(['--name=Grace', '--no-name', '-h', '--transcript']);

    assert.equal(parsed.name, 'Grace');
    assert.equal(parsed.disableName, true);
    assert.equal(parsed.help, true);
    assert.deepEqual(parsed.featuretteArgv, ['--transcript']);
});

test('unknown playback arguments are passed through unchanged', () => {
    const parsed = parseCliOptions(['--speed=2.5', '--future-flag', 'value']);

    assert.deepEqual(parsed.featuretteArgv, ['--speed=2.5', '--future-flag', 'value']);
});

test('name options reject missing and option-like values', () => {
    for (const argv of [['--name'], ['--name='], ['--name', '--fast']]) {
        assert.throws(() => parseCliOptions(argv), /--name requires a value/);
    }
});
