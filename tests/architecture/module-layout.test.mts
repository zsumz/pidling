import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
    inspectModule,
    moduleLineLimit,
} from '../../scripts/architecture/module/module-layout.mts';

test('focused modules inside an owned domain pass', () => {
    assert.deepEqual(inspectModule('src/stage/star.ts', 'export const star = "★";\n'), []);
    assert.deepEqual(inspectModule('tests/stage/star.test.ts', 'export {};\n'), []);
});

test('modules cannot exceed the project line limit', () => {
    const oversized = Array.from({ length: moduleLineLimit + 1 }, () => 'export {};').join('\n');

    assert.match(inspectModule('src/stage/star.ts', oversized).join('\n'), /151 lines/);
});

test('generic module names are rejected', () => {
    for (const name of ['common', 'config', 'helpers', 'utils']) {
        assert.match(
            inspectModule(`src/stage/${name}.ts`, 'export {};\n').join('\n'),
            /domain-specific module name/,
        );
    }
});

test('tooling modules use TypeScript', () => {
    for (const extension of ['js', 'mjs']) {
        assert.match(
            inspectModule(`scripts/release.${extension}`, 'export {};\n').join('\n'),
            /must use \.mts/,
        );
    }
});

test('tests and architecture internals require an owned directory', () => {
    assert.match(
        inspectModule('tests/star.test.ts', 'export {};\n').join('\n'),
        /test domain/,
    );
    assert.match(
        inspectModule('scripts/architecture/rules.mts', 'export {};\n').join('\n'),
        /architecture domain/,
    );
});

test('nested source barrels are rejected', () => {
    assert.match(
        inspectModule('src/stage/index.ts', 'export {};\n').join('\n'),
        /nested barrel/,
    );
    assert.deepEqual(inspectModule('src/index.ts', 'export {};\n'), []);
});
