import type { Layer } from 'featurette';
import { drawStar } from './star.js';
import { stageRow, type StageLayout } from './layout.js';

export function drawBargainingStar(
    layer: Layer,
    layout: StageLayout,
    progress: number,
    unicode = true,
): void {
    const center = {
        x: layout.left + Math.floor(layout.width / 2),
        y: stageRow(layout, 6),
    };
    const pulse = Math.max(0, Math.min(1, progress));

    layer.clear();

    if (pulse >= 0.12) {
        const build = (pulse - 0.12) / 0.88;
        const maxReach = Math.min(14, Math.max(6, Math.floor(layout.width / 2) - 2));
        const reach = Math.floor(4 + build * (maxReach - 4));
        const height = Math.floor(2 + build * 3);
        drawRays(layer, center, reach, height, unicode);
    }

    drawStar(layer, center, unicode);
}

export function drawSaveAttempt(layer: Layer, layout: StageLayout, progress: number): void {
    const width = Math.max(8, Math.min(24, layout.width - 18));

    layer.clear();
    layer.progressBar(layout.left, stageRow(layout, 8), width, progress, {
        completeChar: progress === 0 ? '!' : '#',
        fg: progress === 0 ? 'panic' : 'memory',
        label: 'saving process',
    });
}

function drawRays(
    layer: Layer,
    center: { x: number; y: number },
    reach: number,
    height: number,
    unicode: boolean,
): void {
    const horizontal = unicode ? '─' : '-';
    const vertical = unicode ? '│' : '|';
    const falling = unicode ? '╲' : '\\';
    const rising = unicode ? '╱' : '/';

    for (let distance = 5; distance <= reach; distance += 1) {
        layer.text(center.x - distance, center.y, horizontal, { dim: true, fg: 'panic' });
        layer.text(center.x + distance, center.y, horizontal, { dim: true, fg: 'panic' });

        if (distance >= 9 && distance % 2 === 1) {
            layer.text(center.x - distance, center.y - 1, horizontal, { dim: true, fg: 'panic' });
            layer.text(center.x + distance, center.y + 1, horizontal, { dim: true, fg: 'panic' });
        }
    }

    for (let distance = 3; distance <= height; distance += 1) {
        layer.text(center.x, center.y - distance, vertical, { dim: true, fg: 'panic' });
        layer.text(center.x, center.y + distance, vertical, { dim: true, fg: 'panic' });

        if (distance >= 4) {
            layer.text(center.x - 1, center.y - distance, vertical, { dim: true, fg: 'panic' });
            layer.text(center.x + 1, center.y + distance, vertical, { dim: true, fg: 'panic' });
        }
    }

    for (let distance = 3; distance <= height; distance += 1) {
        const offset = distance * 2;
        layer.text(center.x - offset, center.y - distance, falling, { dim: true, fg: 'panic' });
        layer.text(center.x + offset, center.y + distance, falling, { dim: true, fg: 'panic' });
        layer.text(center.x + offset, center.y - distance, rising, { dim: true, fg: 'panic' });
        layer.text(center.x - offset, center.y + distance, rising, { dim: true, fg: 'panic' });

        if (distance >= 4) {
            layer.text(center.x - offset + 1, center.y - distance, falling, { dim: true, fg: 'panic' });
            layer.text(center.x + offset - 1, center.y + distance, falling, { dim: true, fg: 'panic' });
            layer.text(center.x + offset - 1, center.y - distance, rising, { dim: true, fg: 'panic' });
            layer.text(center.x - offset + 1, center.y + distance, rising, { dim: true, fg: 'panic' });
        }
    }
}
