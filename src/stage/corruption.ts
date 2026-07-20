import type { Layer, TerminalInfo } from 'featurette';
import { fitLabel, stageLayout } from './layout.js';

const CORRUPTION_LINES = [
    'stage.integrity',
    'stdout: open',
    'viewer: present',
    'star[2] => status.dot',
    'meaning.buffer => volatile',
    'return address => prompt',
] as const;

export function drawCorruption(layer: Layer, terminal: TerminalInfo, frame: number): void {
    const layout = stageLayout(terminal, { height: 11, maxWidth: 58 });
    const progress = ['[##--------]', '[####------]', '[######----]', '[########--]', '[----------]'];
    const visible = Math.min(CORRUPTION_LINES.length, frame + 2);

    layer.clear();
    layer.box(layout.left, layout.top, layout.width, layout.height, {
        borderStyle: { fg: frame >= 3 ? 'panic' : 'night' },
        title: 'stdout',
    });

    CORRUPTION_LINES.slice(0, visible).forEach((line, index) => {
        const value = index === 0 ? `${line} ${progress[frame] ?? progress.at(-1)}` : line;
        layer.text(layout.left + 3, layout.top + 2 + index, fitLabel(value, layout.width - 6), {
            dim: index !== 0,
            fg: index === 0 || index === 4 ? 'panic' : 'system',
        });
    });
}
