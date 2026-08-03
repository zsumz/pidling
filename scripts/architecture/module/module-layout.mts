import path from 'node:path';

export const moduleLineLimit = 150;

const vagueModuleNames = new Set(['common', 'config', 'helpers', 'utils']);

export function inspectModule(relativePath: string, source: string): string[] {
    const issues: string[] = [];
    const lineCount = countLines(source);
    const parsed = path.parse(relativePath);

    if (lineCount > moduleLineLimit) {
        issues.push(`${relativePath} has ${String(lineCount)} lines; limit is ${String(moduleLineLimit)}`);
    }

    if (vagueModuleNames.has(parsed.name)) {
        issues.push(`${relativePath} needs a domain-specific module name`);
    }

    if (parsed.ext === '.js' || parsed.ext === '.mjs') {
        issues.push(`${relativePath} must use .mts for TypeScript tooling`);
    }

    if (path.dirname(relativePath) === 'tests') {
        issues.push(`${relativePath} must live with its test domain under tests/`);
    }

    if (path.dirname(relativePath) === 'scripts/architecture'
        && relativePath !== 'scripts/architecture/check.mts') {
        issues.push(`${relativePath} must live with its architecture domain`);
    }

    if (parsed.base === 'index.ts' && relativePath !== 'src/index.ts') {
        issues.push(`${relativePath} hides ownership behind a nested barrel`);
    }

    return issues;
}

function countLines(source: string): number {
    if (source.length === 0) return 0;
    return source.split(/\r?\n/).length - (source.endsWith('\n') ? 1 : 0);
}
