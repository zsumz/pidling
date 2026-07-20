export interface RandomPoint {
    x: number;
    y: number;
}

export function hashText(value: string): number {
    let hash = 2166136261;

    for (const character of value) {
        hash ^= character.codePointAt(0) ?? 0;
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

export function createRandom(seed: number): () => number {
    let value = seed || 1;

    return () => {
        value = Math.imul(value, 1664525) + 1013904223;
        return (value >>> 0) / 4294967296;
    };
}

export function createRunPoints(seed: number, count = 7): RandomPoint[] {
    const random = createRandom(seed);

    return Array.from({ length: count }, (_, index) => ({
        x: 0.08 + index / Math.max(1, count - 1) * 0.84,
        y: 0.12 + random() * 0.76,
    }));
}
