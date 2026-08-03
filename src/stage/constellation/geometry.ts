import type { TerminalInfo } from 'featurette';
import { stageLayout, type StageLayout } from '../layout.js';
import type { Constellation } from './model.js';

interface ResolvedConstellation {
    center: { x: number; y: number };
    stars: Array<{ x: number; y: number }>;
}

const STAR_DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 0.72, y: -0.72 },
    { x: 1, y: 0 },
    { x: 0.72, y: 0.72 },
    { x: 0, y: 1 },
    { x: -0.72, y: 0.72 },
    { x: -1, y: 0 },
    { x: -0.72, y: -0.72 },
] as const;

export function constellationPath(
    terminal: TerminalInfo,
    constellation: Constellation,
): [{ x: number; y: number }, { x: number; y: number }, ...Array<{ x: number; y: number }>] {
    const { center, stars } = resolveConstellation(terminal, constellation.points);
    const path = [center];

    for (const star of stars) path.push(star, center);

    const [first, second = center, ...rest] = path;
    return [first, second, ...rest];
}

export function resolveConstellation(
    terminal: TerminalInfo,
    points: Constellation['points'],
): ResolvedConstellation {
    const layout = constellationLayout(terminal);
    const innerWidth = Math.max(1, layout.width - 6);
    const innerHeight = Math.max(1, layout.height - 5);
    const center = {
        x: layout.left + 3 + Math.round(innerWidth * 0.5),
        y: layout.top + 2 + Math.round(innerHeight * 0.48),
    };
    const stars = STAR_DIRECTIONS.map((direction, index) => {
        const source = points[index % Math.max(1, points.length)] ?? { x: 0.5, y: 0.5 };
        const reach = 0.78 + source.y * 0.2;

        return {
            x: center.x + Math.round(direction.x * innerWidth * 0.43 * reach),
            y: center.y + Math.round(direction.y * innerHeight * 0.48 * reach),
        };
    });

    return { center, stars };
}

export function constellationLayout(terminal: TerminalInfo): StageLayout {
    return stageLayout(terminal, {
        height: terminal.rows < 22 ? 12 : 14,
        maxWidth: 58,
    });
}
