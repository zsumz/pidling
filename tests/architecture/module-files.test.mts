import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';
import { listModuleFiles } from '../../scripts/architecture/module/module-files.mts';

test('includes root TypeScript tooling in the architecture scan', async () => {
    const testDirectory = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(testDirectory, '../..');
    const files = await listModuleFiles(projectRoot);

    for (const config of ['eslint.config.mts', 'tsdown.config.mts', 'vitest.config.mts']) {
        assert.ok(files.includes(config), `${config} is not architecture-owned`);
    }
});
