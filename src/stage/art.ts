import type { Layer } from 'featurette';

const SPARK_HALO = [
    '    ·    ',
    '  ·   ·  ',
    '·       ·',
    '  ·   ·  ',
    '    ·    ',
] as const;

export function drawSpark(layer: Layer, frame: number, unicode = true, offsetY = 0): void {
    layer.clear();

    if (frame <= 0) {
        layer.text({ x: 'center', y: 'middle', dy: offsetY }, unicode ? '·' : '.', { dim: true, fg: 'memory' });
        return;
    }

    if (frame === 1) {
        layer.text({ x: 'center', y: 'middle', dy: offsetY }, unicode ? '✦' : '+', { fg: 'memory' });
        return;
    }

    const halo = SPARK_HALO.map((line) => unicode ? line : line.replaceAll('·', '.'));
    layer.frame(halo, { x: 'center', y: 'middle', dy: offsetY }, { dim: true, fg: 'memory' });
    layer.text({ x: 'center', y: 'middle', dy: offsetY }, unicode ? '★' : '*', { bold: true, fg: 'memory' });
}
