import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            exclude: [
                'src/cli.ts',
            ],
            include: [
                'src/**/*.ts',
            ],
            provider: 'v8',
            reporter: ['text'],
            thresholds: {
                branches: 85,
                functions: 98,
                lines: 99,
                statements: 99,
            },
        },
        include: ['tests/**/*.test.ts'],
    },
});
