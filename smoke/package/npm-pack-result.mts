interface NpmPackResult {
    filename: string;
    name?: string;
    version?: string;
}

export function npmPackResult(stdout: string, packageName: string): NpmPackResult {
    const parsed = trailingJson(stdout);
    const candidate: unknown = array(parsed)?.[0] ?? record(parsed)?.[packageName] ?? parsed;
    const entry = record(candidate);

    if (!entry || typeof entry.filename !== 'string') {
        throw new Error('npm pack JSON did not include a tarball filename.');
    }

    const result: NpmPackResult = { filename: entry.filename };
    if (typeof entry.name === 'string') result.name = entry.name;
    if (typeof entry.version === 'string') result.version = entry.version;

    return result;
}

function trailingJson(stdout: string): unknown {
    const trimmed = stdout.trim();

    for (let index = 0; index < trimmed.length; index += 1) {
        const candidate = trimmed.slice(index);

        try {
            return JSON.parse(candidate) as unknown;
        } catch {
            // npm lifecycle output can precede the final JSON payload.
        }
    }

    throw new Error('npm pack did not return parseable JSON output.');
}

function array(value: unknown): unknown[] | undefined {
    return Array.isArray(value) ? value as unknown[] : undefined;
}

function record(value: unknown): Record<string, unknown> | undefined {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined;
}
