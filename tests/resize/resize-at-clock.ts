import type { Clock } from 'featurette';
import type { FakeResizeSource } from './fake-resize-source.js';

export class ResizeAtClock implements Clock {
    private elapsed = 0;
    private resized = false;

    constructor(
        private readonly source: FakeResizeSource,
        private readonly resizeAt: number,
    ) {}

    public now(): number {
        return this.elapsed;
    }

    public async wait(ms: number): Promise<void> {
        this.elapsed += ms;

        if (!this.resized && this.elapsed >= this.resizeAt) {
            this.resized = true;
            this.source.resize(78, 23);
            await new Promise<void>((resolve) => {
                setImmediate(resolve);
            });
        }
    }
}
