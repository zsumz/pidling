import type { SceneContext, Style } from 'featurette';
import type { StageLayout } from './layout.js';
import { stageRow } from './layout.js';

export interface BoardLine {
    align?: 'center' | 'left' | 'right';
    column?: number;
    row: number;
    speed?: number;
    style?: Style;
    text: string;
    voice?: string;
}

export function drawBoard(
    context: SceneContext,
    layerName: string,
    layout: StageLayout,
    lines: BoardLine[],
): void {
    const layer = context.layer(layerName, { zIndex: 20 });

    layer.clear();
    lines.forEach((line) => {
        layer.text(
            layout.left + lineColumn(layout, line),
            stageRow(layout, line.row),
            line.text,
            line.style ?? voiceStyle(line.voice),
        );
    });
}

export async function addBoardLine(
    context: SceneContext,
    layerName: string,
    layout: StageLayout,
    lines: BoardLine[],
    line: BoardLine,
): Promise<void> {
    lines.push(line);
    await context.type(line.text, {
        ...line.style,
        at: {
            x: layout.left + lineColumn(layout, line),
            y: stageRow(layout, line.row),
        },
        advance: 'none',
        layer: layerName,
        speed: line.speed,
        voice: line.voice,
    });
}

function lineColumn(layout: StageLayout, line: BoardLine): number {
    if (line.column !== undefined) return line.column;
    if (line.align === 'center') return Math.max(0, Math.floor((layout.width - line.text.length) / 2));
    if (line.align === 'right') return Math.max(0, layout.width - line.text.length);
    return 0;
}

function voiceStyle(voice: string | undefined): Style {
    if (voice === 'system') {
        return { dim: true, fg: 'system' };
    }

    if (voice === 'panic') {
        return { bold: true, fg: 'panic' };
    }

    if (voice === 'memory') {
        return { fg: 'memory' };
    }

    return { fg: 'process' };
}
