import type { SceneContext } from 'featurette';

export interface ResizeDirector {
    dispose(): void;
    setRedraw(redraw: () => void | Promise<void>): void;
}

export function directResize(context: SceneContext): ResizeDirector {
    let redraw: () => void | Promise<void> = () => undefined;
    const dispose = context.onResize(async ({ current }) => {
        const verySmall = current.columns < 24 || current.rows < 8;

        await context.clear();
        await context.type(verySmall ? 'oh. walls moved.' : 'oh. the walls moved.', {
            at: { x: 'center', y: 'middle', dy: -1 },
            advance: 'none',
            speed: 38,
            voice: 'process',
        });
        await context.type(`${String(current.columns)}x${String(current.rows)}. ${verySmall ? 'holding on.' : 'new room.'}`, {
            at: { x: 'center', y: 'middle', dy: 1 },
            advance: 'none',
            speed: 0,
            voice: 'system',
        });
        await context.beat(550);

        await context.clear();
        await redraw();
    });

    return {
        dispose,
        setRedraw(nextRedraw) {
            redraw = nextRedraw;
        },
    };
}
