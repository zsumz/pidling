import path from 'node:path';
import ts from 'typescript';

export function sourceImports(relativePath: string, source: string): string[] {
    const sourceFile = ts.createSourceFile(
        relativePath,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
    );

    return sourceFile.statements
        .map((statement) => moduleSpecifier(statement))
        .filter((specifier): specifier is string => specifier?.startsWith('.') === true)
        .map((specifier) => resolveSourceImport(relativePath, specifier))
        .sort();
}

function moduleSpecifier(statement: ts.Statement): string | undefined {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) return;
    if (!statement.moduleSpecifier || !ts.isStringLiteralLike(statement.moduleSpecifier)) return;

    return statement.moduleSpecifier.text;
}

function resolveSourceImport(relativePath: string, specifier: string): string {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), specifier));
    const extension = path.posix.extname(resolved);

    if (extension === '.js') return `${resolved.slice(0, -3)}.ts`;
    if (extension === '.mjs') return `${resolved.slice(0, -4)}.mts`;
    if (extension.length === 0) return `${resolved}.ts`;

    return resolved;
}
