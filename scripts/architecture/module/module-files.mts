import { readdir } from 'node:fs/promises';
import path from 'node:path';

const moduleExtensions = new Set(['.js', '.mjs', '.mts', '.ts']);
const ownedRoots = ['scripts', 'smoke', 'src', 'tests'];

export async function listModuleFiles(projectRoot: string): Promise<string[]> {
    const rootEntries = await readdir(projectRoot, { withFileTypes: true });
    const rootModules = rootEntries
        .filter((entry) => entry.isFile() && moduleExtensions.has(path.extname(entry.name)))
        .map((entry) => entry.name);
    const ownedModules = await Promise.all(
        ownedRoots.map(async (root) =>
            await walk(path.join(projectRoot, root), projectRoot)),
    );

    return [...rootModules, ...ownedModules.flat()].sort();
}

async function walk(directory: string, projectRoot: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const absolutePath = path.join(directory, entry.name);

        if (entry.isDirectory()) return walk(absolutePath, projectRoot);
        if (!moduleExtensions.has(path.extname(entry.name))) return [];

        return [path.relative(projectRoot, absolutePath).split(path.sep).join(path.posix.sep)];
    }));

    return files.flat();
}
