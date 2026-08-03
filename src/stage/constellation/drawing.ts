import type { Layer, TerminalInfo } from 'featurette';
import { fitLabel } from '../layout.js';
import { drawStar } from '../star.js';
import { constellationLayout, resolveConstellation } from './geometry.js';
import type { Constellation } from './model.js';

export function drawConstellation(
    layer: Layer,
    terminal: TerminalInfo,
    constellation: Constellation,
    options: { reveal?: number } = {},
): void {
    const layout = constellationLayout(terminal);
    const { center, stars } = resolveConstellation(terminal, constellation.points);
    const pointMark = terminal.unicode ? '·' : '.';
    const reveal = Math.max(0, Math.min(1, options.reveal ?? 1));
    const complete = reveal >= 1;

    layer.clear();
    layer.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: 'night', dim: true },
        title: complete ? fitLabel(constellation.label, Math.max(1, layout.width - 8)) : undefined,
    });

    stars.forEach((star, index) => {
        const lineThreshold = (index + 0.15) / stars.length;
        const starThreshold = (index + 0.5) / stars.length;

        if (reveal >= lineThreshold) {
            drawDottedLine(layer, center, star, pointMark);
        }
        if (reveal < starThreshold) return;

        const bright = index % 2 === 0;
        layer.text(star.x, star.y, bright ? terminal.unicode ? '✦' : '*' : pointMark, {
            bold: bright,
            fg: 'memory',
        });
    });
    drawStar(layer, center, terminal.unicode);

    if (complete) {
        layer.text(layout.left + 3, layout.top + layout.height - 2, constellation.runLabel, {
            dim: true,
            fg: 'system',
        });
    }
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
