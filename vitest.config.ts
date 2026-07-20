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
        },
        include: ['tests/**/*.test.ts'],
    },
});
