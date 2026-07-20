#!/usr/bin/env node

import { playCli } from 'featurette/node';
import { createPidlingFilm } from './film.js';
import { CLI_HELP } from './runtime/help.js';
import { parseCliOptions } from './runtime/cli-options.js';
import { resolveViewerName } from './runtime/viewer.js';

try {
    const options = parseCliOptions(process.argv.slice(2));

    if (options.help) {
        process.stdout.write(CLI_HELP);
    } else {
        const viewer = resolveViewerName({
            disabled: options.disableName,
            env: process.env,
            explicitName: options.name,
        });
        const film = createPidlingFilm({ viewer });

        await playCli(film, { argv: options.featuretteArgv });
    }
} catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`pidling crashed: ${message}\n`);
    process.exitCode = 1;
}
