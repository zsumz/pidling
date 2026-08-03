import type { Layer, Position } from 'featurette';

const SPARK_HALO = [
    '    ·    ',
    '  ·   ·  ',
    '·       ·',
    '  ·   ·  ',
    '    ·    ',
] as const;

export function drawSpark(layer: Layer, frame: number, unicode = true, offsetY = 0): void {
    layer.clear();
    const center: Position = { x: 'center', y: 'middle', dy: offsetY };

    if (frame <= 0) {
        layer.text(center, unicode ? '·' : '.', { dim: true, fg: 'memory' });
        return;
    }

    if (frame === 1) {
        layer.text(center, unicode ? '✦' : '+', { fg: 'memory' });
        return;
    }

    drawStar(layer, center, unicode);
}

export function drawStar(layer: Layer, center: Position, unicode = true): void {
    const halo = SPARK_HALO.map((line) => unicode ? line : line.replaceAll('·', '.'));
    const placement = starPlacement(center);

    layer.frame(halo, placement.halo, { dim: true, fg: 'memory' });
    layer.text(placement.core, unicode ? '★' : '*', { bold: true, fg: 'memory' });
}

function starPlacement(center: Position): { core: Position; halo: Position } {
    const x = center.x ?? 'center';
    const y = center.y ?? 'middle';

    if (typeof x === 'number' && typeof y === 'number') {
        return {
            core: center,
            halo: { x: x - 4, y: y - 2 },
        };
    }

    return { core: center, halo: center };
}
