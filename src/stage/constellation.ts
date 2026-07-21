import type { Layer, TerminalInfo } from 'featurette';
import type { RandomPoint } from '../story/random.js';
import { fitLabel, stageLayout, type StageLayout } from './layout.js';

export interface Constellation {
    label: string;
    points: RandomPoint[];
    runLabel: string;
}

export function constellationPath(
    terminal: TerminalInfo,
    constellation: Constellation,
): [{ x: number; y: number }, { x: number; y: number }, ...Array<{ x: number; y: number }>] {
    const { center, stars } = resolveConstellation(terminal, constellation.points);
    const path = [center];

    for (const star of stars) {
        path.push(star, center);
    }

    const [first, second = center, ...rest] = path;

    return [first, second, ...rest];
}

export function drawConstellation(
    layer: Layer,
    terminal: TerminalInfo,
    constellation: Constellation,
): void {
    const layout = constellationLayout(terminal);
    const { center, stars } = resolveConstellation(terminal, constellation.points);
    const pointMark = terminal.unicode ? '·' : '.';

    layer.clear();
    layer.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: 'night', dim: true },
        title: fitLabel(constellation.label, Math.max(1, layout.width - 8)),
    });

    for (const star of stars) {
        drawDottedLine(layer, center, star, pointMark);
    }

    stars.forEach((star, index) => {
        const bright = index % 2 === 0;
        layer.text(star.x, star.y, bright ? terminal.unicode ? '✦' : '*' : pointMark, {
            bold: bright,
            fg: 'memory',
        });
    });
    layer.text(center.x, center.y, terminal.unicode ? '★' : '*', { bold: true, fg: 'memory' });
    layer.text(layout.left + 3, layout.top + layout.height - 2, constellation.runLabel, {
        dim: true,
        fg: 'system',
    });
}

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

function resolveConstellation(terminal: TerminalInfo, points: RandomPoint[]): ResolvedConstellation {
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

function constellationLayout(terminal: TerminalInfo): StageLayout {
    return stageLayout(terminal, {
        height: terminal.rows < 22 ? 12 : 14,
        maxWidth: 58,
    });
}

function drawDottedLine(
    layer: Layer,
    from: { x: number; y: number },
    to: { x: number; y: number },
    mark: string,
): void {
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));

    for (let step = 3; step <= steps - 3; step += 4) {
        const progress = step / steps;
        layer.text(
            Math.round(from.x + (to.x - from.x) * progress),
            Math.round(from.y + (to.y - from.y) * progress),
            mark,
            { dim: true, fg: 'system' },
        );
    }
}
