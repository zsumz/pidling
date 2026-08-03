import type { SourceModule } from './source-module.mts';

export function findImportCycles(modules: SourceModule[]): string[] {
    const graph: Map<string, string[]> = new Map(
        modules.map((module) => [module.path, module.imports]),
    );
    const completed: Set<string> = new Set();
    const active: Set<string> = new Set();
    const stack: string[] = [];
    const cycles: Set<string> = new Set();

    function visit(modulePath: string): void {
        active.add(modulePath);
        stack.push(modulePath);
        const targets = graph.get(modulePath) ?? [];

        for (const target of [...targets].sort()) {
            if (!graph.has(target)) continue;
            if (active.has(target)) cycles.add(canonicalCycle(stack, target));
            else if (!completed.has(target)) visit(target);
        }

        stack.pop();
        active.delete(modulePath);
        completed.add(modulePath);
    }

    for (const modulePath of [...graph.keys()].sort()) {
        if (!completed.has(modulePath)) visit(modulePath);
    }

    return [...cycles].sort();
}

function canonicalCycle(stack: string[], target: string): string {
    const cycle = stack.slice(stack.indexOf(target));
    const rotations = cycle.map((_, index) => [...cycle.slice(index), ...cycle.slice(0, index)]);
    const canonical = rotations.map((rotation) => rotation.join(' -> ')).sort()[0];
    const first = canonical.split(' -> ')[0];

    return `${canonical} -> ${first}`;
}
