import type { Layer, TerminalInfo } from 'featurette';
import type { RandomPoint } from '../story/random.js';
import { fitLabel, stageLayout } from './layout.js';

export interface Constellation {
    label: string;
    points: RandomPoint[];
    runLabel: string;
}

export function constellationPath(
    terminal: TerminalInfo,
    constellation: Constellation,
): [{ x: number; y: number }, { x: number; y: number }, ...Array<{ x: number; y: number }>] {
    const points = resolvePoints(terminal, constellation.points);
    const [first, second, ...rest] = points;

    return [first, second, ...rest];
}

export function drawConstellation(
    layer: Layer,
    terminal: TerminalInfo,
    constellation: Constellation,
): void {
    const layout = stageLayout(terminal, { height: 12, maxWidth: 54 });
    const points = resolvePoints(terminal, constellation.points);

    layer.clear();
    layer.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: 'night', dim: true },
        title: fitLabel(constellation.label, Math.max(1, layout.width - 8)),
    });

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];

        layer.line(previous.x, previous.y, current.x, current.y, { fg: 'system', dim: true });
    }

    points.forEach((point, index) => {
        layer.text(point.x, point.y, index === points.length - 1 ? '*' : '+', {
            bold: index === points.length - 1,
            fg: 'memory',
        });
    });
    layer.text(layout.left + 3, layout.top + layout.height - 2, constellation.runLabel, {
        dim: true,
        fg: 'system',
    });
}

function resolvePoints(terminal: TerminalInfo, points: RandomPoint[]): Array<{ x: number; y: number }> {
    const layout = stageLayout(terminal, { height: 12, maxWidth: 54 });
    const innerWidth = Math.max(1, layout.width - 6);
    const innerHeight = Math.max(1, layout.height - 5);

    return points.map((point) => ({
        x: layout.left + 3 + Math.round(point.x * innerWidth),
        y: layout.top + 2 + Math.round(point.y * innerHeight),
    }));
}
