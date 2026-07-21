import type { Layer, TerminalInfo } from 'featurette';
import type { StageLayout } from './layout.js';
import { drawPlaceFrame } from './place.js';

export const COLLAPSE_FRAME_COUNT = 6;

export function drawCollapse(
    layer: Layer,
    terminal: TerminalInfo,
    runSeed: number,
    frame: number,
    layout: StageLayout,
): void {
    const progress = Math.min(1, (frame + 1) / COLLAPSE_FRAME_COUNT);
    drawPlaceFrame(layer, terminal, runSeed, layout, progress);

    if (frame >= COLLAPSE_FRAME_COUNT - 1) {
        drawBrokenRoom(layer, layout, terminal.unicode);
    }
}

function drawBrokenRoom(layer: Layer, layout: StageLayout, unicode: boolean): void {
    const horizontal = unicode ? '─' : '-';
    const vertical = unicode ? '│' : '|';
    const leftCorner = unicode ? '┌' : '+';
    const rightCorner = unicode ? '┐' : '+';
    const span = Math.max(3, Math.floor(layout.width * 0.16));
    const right = layout.left + layout.width - 1;
    const bottom = layout.top + layout.height - 1;

    layer.clear();
    layer.text(layout.left, layout.top, `${leftCorner}${horizontal.repeat(span)}`, { dim: true, fg: 'night' });
    layer.text(right - span, layout.top, `${horizontal.repeat(span)}${rightCorner}`, { dim: true, fg: 'night' });
    layer.text(layout.left, layout.top + 2, vertical, { dim: true, fg: 'night' });
    layer.text(right, bottom - 2, vertical, { dim: true, fg: 'night' });
    layer.text(layout.left + 2, bottom, horizontal.repeat(span), { dim: true, fg: 'night' });
    layer.text(right - span - 2, bottom, horizontal.repeat(span), { dim: true, fg: 'night' });
    layer.text(layout.left + Math.floor(layout.width * 0.37), layout.top + 4, unicode ? '·' : '.', {
        dim: true,
        fg: 'system',
    });
}
