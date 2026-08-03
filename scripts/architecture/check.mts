import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listModuleFiles } from './module/module-files.mts';
import { inspectModule } from './module/module-layout.mts';
import { inspectImportBoundaries } from './source/import-boundaries.mts';
import { findImportCycles } from './source/import-cycles.mts';
import { sourceImports } from './source/source-imports.mts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '../..');
const files = await listModuleFiles(projectRoot);
const modules = await Promise.all(files.map(async (relativePath) => {
    const source = await readFile(path.join(projectRoot, relativePath), 'utf8');
    return { path: relativePath, source };
}));
const sourceModules = modules
    .filter((module) => module.path.startsWith('src/'))
    .map((module) => ({
        path: module.path,
        imports: sourceImports(module.path, module.source),
    }));
const issues = [
    ...modules.flatMap((module) => inspectModule(module.path, module.source)),
    ...inspectImportBoundaries(sourceModules),
    ...findImportCycles(sourceModules).map((cycle) => `source import cycle: ${cycle}`),
];

if (issues.length > 0) {
    console.error('Architecture guardrails failed:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
} else {
    console.log(`Architecture guardrails passed for ${String(files.length)} modules.`);
}
