import assert from 'node:assert/strict';
import { test } from 'vitest';
import { cleanViewerName, resolveViewerName } from '../src/runtime/viewer.js';

test('viewer discovery follows explicit, Pidling, shell, and system precedence', () => {
    let unnecessarySystemReads = 0;
    assert.deepEqual(
        resolveViewerName({
            env: { LOGNAME: 'logname', PIDLING_VIEWER_NAME: 'pidling', USER: 'shellperson' },
            explicitName: 'explicit',
            systemUsername: () => {
                unnecessarySystemReads += 1;
                return 'system';
            },
        }),
        { display: 'Explicit', raw: 'explicit' },
    );
    assert.equal(unnecessarySystemReads, 0);
    assert.deepEqual(
        resolveViewerName({ env: { PIDLING_VIEWER_NAME: 'pidling', USER: 'shellperson' } }),
        { display: 'Pidling', raw: 'pidling' },
    );
    assert.deepEqual(
        resolveViewerName({ env: { LOGNAME: 'logname', USER: 'shellperson' } }),
        { display: 'Shellperson', raw: 'shellperson' },
    );
    assert.deepEqual(
        resolveViewerName({ env: { LOGNAME: 'logname' } }),
        { display: 'Logname', raw: 'logname' },
    );
    assert.deepEqual(
        resolveViewerName({ env: {}, systemUsername: () => 'system' }),
        { display: 'System', raw: 'system' },
    );
    assert.deepEqual(
        resolveViewerName({ env: { LOGNAME: 'grace', USER: 'user' } }),
        { display: 'Grace', raw: 'grace' },
    );
});

test('viewer opt-out avoids every discovery source', () => {
    let systemReads = 0;
    const viewer = resolveViewerName({
        disabled: true,
        env: { PIDLING_VIEWER_NAME: 'grace' },
        explicitName: 'ada',
        systemUsername: () => {
            systemReads += 1;
            return 'system';
        },
    });

    assert.equal(viewer, undefined);
    assert.equal(systemReads, 0);
});

test('explicit name sources never fall through to ambient identity', () => {
    assert.equal(
        resolveViewerName({ env: { USER: 'ada' }, explicitName: 'root' }),
        undefined,
    );
    assert.equal(
        resolveViewerName({ env: { PIDLING_VIEWER_NAME: 'unknown', USER: 'ada' } }),
        undefined,
    );
});

test('account-like and Unicode names become shallow display names', () => {
    assert.deepEqual(
        cleanViewerName('DOMAIN\\ada.lovelace@example.com'),
        { display: 'Ada', raw: 'ada.lovelace' },
    );
    assert.deepEqual(cleanViewerName('  émilie.dev  '), { display: 'Émilie', raw: 'émilie.dev' });
    assert.deepEqual(cleanViewerName('o\'connor'), { display: 'O\'connor', raw: 'o\'connor' });
});

test('empty, reserved, oversized, and symbol-only names are ignored', () => {
    for (const value of [undefined, '', 'root', 'UNKNOWN', 'user', '😀', 'x'.repeat(65)]) {
        assert.equal(cleanViewerName(value), undefined);
    }
});
