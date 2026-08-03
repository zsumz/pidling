import assert from 'node:assert/strict';
import { test } from 'vitest';
import { npmPackResult } from '../../smoke/package/npm-pack-result.mts';

const packed = {
    filename: 'pidling-0.1.0-alpha.0.tgz',
    name: 'pidling',
    version: '0.1.0-alpha.0',
};

test('reads the npm pack array shape', () => {
    assert.deepEqual(npmPackResult(JSON.stringify([packed]), 'pidling'), packed);
});

test('reads prerelease metadata keyed by package name', () => {
    const stdout = `build complete\n${JSON.stringify({ pidling: packed })}`;

    assert.deepEqual(npmPackResult(stdout, 'pidling'), packed);
});

test('rejects npm output without a tarball', () => {
    assert.throws(() => npmPackResult('{}', 'pidling'), /tarball filename/u);
    assert.throws(() => npmPackResult('build failed', 'pidling'), /parseable JSON/u);
});
