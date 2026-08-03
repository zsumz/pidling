import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: [
        'src/cli.ts',
        'src/index.ts',
    ],
    format: ['esm'],
    dts: true,
    clean: true,
    hash: false,
    target: 'node20',
    inputOptions(options) {
        const rawOptions = options as unknown as Record<string, unknown>;
        delete rawOptions.define;
        delete rawOptions.inject;
    },
});
