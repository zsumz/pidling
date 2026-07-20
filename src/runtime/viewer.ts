import { userInfo } from 'node:os';

export interface ViewerName {
    display: string;
    raw: string;
}

export interface ResolveViewerOptions {
    disabled?: boolean;
    env?: NodeJS.ProcessEnv;
    explicitName?: string;
    systemUsername?: () => string | undefined;
}

export function resolveViewerName(options: ResolveViewerOptions = {}): ViewerName | undefined {
    if (options.disabled) {
        return undefined;
    }

    const env = options.env ?? process.env;
    const systemUsername = options.systemUsername ?? readSystemUsername;

    if (options.explicitName !== undefined) {
        return cleanViewerName(options.explicitName);
    }

    if (env.PIDLING_VIEWER_NAME !== undefined) {
        return cleanViewerName(env.PIDLING_VIEWER_NAME);
    }

    for (const candidate of [env.USER, env.LOGNAME]) {
        const viewer = cleanViewerName(candidate);
        if (viewer) {
            return viewer;
        }
    }

    return cleanViewerName(systemUsername());
}

export function cleanViewerName(value: string | undefined): ViewerName | undefined {
    const raw = value?.trim();

    if (!raw || raw.length > 64) {
        return undefined;
    }

    const accountName = raw.split(/[\\/]/u).at(-1)?.split('@')[0] ?? '';
    const firstPart = accountName.split(/[._\-\s]+/u).find(Boolean);

    if (!firstPart || ['root', 'unknown', 'user'].includes(firstPart.toLowerCase())) {
        return undefined;
    }

    const safe = firstPart.replace(/[^\p{L}\p{N}'-]/gu, '');

    if (!safe) {
        return undefined;
    }

    return {
        display: `${safe.charAt(0).toLocaleUpperCase()}${safe.slice(1)}`,
        raw: accountName,
    };
}

function readSystemUsername(): string | undefined {
    try {
        return userInfo().username;
    } catch {
        return undefined;
    }
}
