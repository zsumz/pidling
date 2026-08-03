import { createRandom } from '../random.js';
import type { ConstellationPoint } from './model.js';

export function createRunPoints(seed: number, count = 8): ConstellationPoint[] {
    const random = createRandom(seed);

    return Array.from({ length: count }, (_, index) => ({
        x: 0.08 + index / Math.max(1, count - 1) * 0.84,
        y: 0.12 + random() * 0.76,
    }));
}
