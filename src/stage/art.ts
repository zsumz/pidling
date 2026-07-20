import type { Layer, TerminalInfo } from 'featurette';
import { stageLayout } from './layout.js';

const SPARK_FRAMES = [
    ['.'],
    ['+'],
    [
        '  |  ',
        '\\ | /',
        '--*--',
        '/ | \\',
        '  |  ',
    ],
] as const;

const SUNRISE = [
    '       .              *',
    '              .',
    '          \\   |   /',
    '           \\  |  /',
    '        ----  *  ----',
    '           /  |  \\',
    '          /   |   \\',
] as const;

export function drawSpark(layer: Layer, frame: number): void {
    const art = SPARK_FRAMES[Math.max(0, Math.min(frame, SPARK_FRAMES.length - 1))] ?? SPARK_FRAMES[0];
    layer.clear().frame([...art], { x: 'center', y: 'middle' }, { fg: 'memory', bold: frame > 1 });
}

export function drawSunrise(
    layer: Layer,
    terminal: TerminalInfo,
    revealed: number = SUNRISE.length,
): void {
    const layout = stageLayout(terminal, { height: 12, maxWidth: 46 });
    const visible = SUNRISE.map((line, index) => index < revealed ? line : '');

    layer.clear();
    layer.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: 'life', dim: true },
    });
    layer.frame(visible, { x: 'center', y: layout.top + 2 }, { fg: 'memory' });
}

export const SUNRISE_LINE_COUNT = SUNRISE.length;
