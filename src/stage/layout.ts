import type { TerminalInfo } from 'featurette';

export interface StageLayout {
    compact: boolean;
    height: number;
    left: number;
    top: number;
    width: number;
}

export function stageLayout(
    terminal: TerminalInfo,
    options: { height: number; maxWidth?: number; padding?: number },
): StageLayout {
    const padding = Math.max(0, options.padding ?? 2);
    const width = Math.max(1, Math.min(options.maxWidth ?? 64, terminal.columns - padding * 2));
    const height = Math.max(1, Math.min(options.height, terminal.rows));

    return {
        compact: terminal.columns < 72 || terminal.rows < 22,
        height,
        left: Math.max(0, Math.floor((terminal.columns - width) / 2)),
        top: Math.max(0, Math.floor((terminal.rows - height) / 2)),
        width,
    };
}

export function stageRow(layout: StageLayout, offset: number): number {
    return Math.max(layout.top, Math.min(layout.top + offset, layout.top + layout.height - 1));
}

export function fitLabel(value: string, width: number): string {
    const limit = Math.max(0, Math.floor(width));

    if (value.length <= limit) {
        return value;
    }

    if (limit < 4) {
        return value.slice(0, limit);
    }

    return `${value.slice(0, limit - 3)}...`;
}
