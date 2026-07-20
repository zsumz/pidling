export interface PidlingCliOptions {
    disableName: boolean;
    featuretteArgv: string[];
    help: boolean;
    name?: string;
}

export function parseCliOptions(argv: string[]): PidlingCliOptions {
    const parsed: PidlingCliOptions = {
        disableName: false,
        featuretteArgv: [],
        help: false,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index] ?? '';

        if (argument === '--help' || argument === '-h') {
            parsed.help = true;
        } else if (argument === '--no-name') {
            parsed.disableName = true;
        } else if (argument === '--name') {
            parsed.name = requireName(argv[index + 1]);
            index += 1;
        } else if (argument.startsWith('--name=')) {
            parsed.name = requireName(argument.slice('--name='.length));
        } else if (argument === '--fast') {
            parsed.featuretteArgv.push('--speed', '16');
        } else {
            parsed.featuretteArgv.push(argument);
        }
    }

    return parsed;
}

function requireName(value: string | undefined): string {
    if (!value || value.startsWith('--')) {
        throw new Error('--name requires a value.');
    }

    return value;
}
