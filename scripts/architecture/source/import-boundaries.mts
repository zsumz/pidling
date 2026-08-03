import { permitsImport, sourceLayer } from './layer-policy.mts';
import type { SourceModule } from './source-module.mts';

export function inspectImportBoundaries(modules: SourceModule[]): string[] {
    return modules.flatMap((module) => inspectModuleImports(module));
}

function inspectModuleImports(module: SourceModule): string[] {
    const source = sourceLayer(module.path);

    if (!source) return [`${module.path} has no source layer ownership`];

    return module.imports.flatMap((targetPath) => {
        const target = sourceLayer(targetPath);

        if (!target || permitsImport(source, target)) return [];

        return [
            `${module.path}: ${source} modules must not import ${target} modules (${targetPath})`,
        ];
    });
}
