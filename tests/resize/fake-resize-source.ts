import type { TerminalInfo, TerminalResizeSource } from 'featurette';

export class FakeResizeSource implements TerminalResizeSource {
    private handler?: () => void;
    private terminal: TerminalInfo;

    constructor(columns: number, rows: number) {
        this.terminal = { colorDepth: 24, columns, isTTY: true, rows, unicode: true };
    }

    public current(): TerminalInfo {
        return { ...this.terminal };
    }

    public onResize(handler: () => void): () => void {
        this.handler = handler;
        return () => {
            this.handler = undefined;
        };
    }

    public resize(columns: number, rows: number): void {
        this.terminal = { ...this.terminal, columns, rows };
        this.handler?.();
    }
}
