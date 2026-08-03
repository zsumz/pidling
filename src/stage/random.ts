export function createRandom(seed: number): () => number {
    let value = seed || 1;

    return () => {
        value = Math.imul(value, 1664525) + 1013904223;
        return (value >>> 0) / 4294967296;
    };
}
