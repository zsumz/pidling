import type { Layer } from 'featurette';

const SPARK_HALO = [
    '    ·    ',
    '  ·   ·  ',
    '·       ·',
    '  ·   ·  ',
    '    ·    ',
] as const;

export function drawSpark(layer: Layer, frame: number, unicode = true): void {
    layer.clear();

    if (frame <= 0) {
        layer.text({ x: 'center', y: 'middle' }, unicode ? '·' : '.', { dim: true, fg: 'memory' });
        return;
    }

    if (frame === 1) {
        layer.text({ x: 'center', y: 'middle' }, unicode ? '✦' : '+', { fg: 'memory' });
        return;
    }

    const halo = SPARK_HALO.map((line) => unicode ? line : line.replaceAll('·', '.'));
    layer.frame(halo, { x: 'center', y: 'middle' }, { dim: true, fg: 'memory' });
    layer.text({ x: 'center', y: 'middle' }, unicode ? '★' : '*', { bold: true, fg: 'memory' });
}
