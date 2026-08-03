export type SourceLayer =
    | 'cli'
    | 'entrypoint'
    | 'film'
    | 'runtime'
    | 'scenes'
    | 'stage'
    | 'story';

const permittedImports: Record<SourceLayer, ReadonlySet<SourceLayer>> = {
    cli: new Set(['cli', 'film', 'runtime']),
    entrypoint: new Set(['entrypoint', 'film', 'story']),
    film: new Set(['film', 'scenes', 'story']),
    runtime: new Set(['runtime', 'story']),
    scenes: new Set(['scenes', 'stage', 'story']),
    stage: new Set(['stage', 'story']),
    story: new Set(['story']),
};

export function sourceLayer(relativePath: string): SourceLayer | undefined {
    if (relativePath === 'src/cli.ts') return 'cli';
    if (relativePath === 'src/film.ts') return 'film';
    if (relativePath === 'src/index.ts') return 'entrypoint';

    const match = /^src\/([^/]+)\//u.exec(relativePath);
    const layer = match?.[1];

    return isSourceLayer(layer) ? layer : undefined;
}

export function permitsImport(source: SourceLayer, target: SourceLayer): boolean {
    return permittedImports[source].has(target);
}

function isSourceLayer(value: string | undefined): value is SourceLayer {
    return value !== undefined && Object.hasOwn(permittedImports, value);
}
