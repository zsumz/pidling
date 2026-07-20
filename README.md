# Pidling

`pidling` is a terminal-native short film about a small process that wakes up, realizes you ran it, makes a place for you, panics about ending, and gives the prompt back.

The movie is written in TypeScript and runs on [`featurette@0.1.0-alpha.3`](https://github.com/zsumz/featurette). Featurette owns terminal rendering, timing, input, resize delivery, transcript fallback, interruption, exit status, and cleanup; this project owns the story and its scenes.

## Run

```bash
npm install
npm start
```

For a quick smoke-test pass:

```bash
npm run demo
```

`demo` prints the complete plain-text transcript without animation.

The viewer name is only guessed from the local shell account. The film says where it found the name and does not treat it as verified identity. Override it with `--name Shawn`, set `PIDLING_VIEWER_NAME`, or disable discovery with `--no-name`.

Use `--fast` for a 16x run. Featurette playback flags such as `--transcript`, `--reduced-motion`, `--no-color`, `--no-unicode`, `--no-alt-screen`, and `--no-ansi` are also available. Run `pidling --help` for the full list.

The visual movie requires at least `48x16`. Smaller terminals receive the transcript. If the room changes size during visual playback, the process pauses, notices that the walls moved, and redraws the current stage.

The movie catches `Ctrl+C` once so it can finish one last sentence. A second `Ctrl+C` exits immediately.

## Develop

```bash
npm run validate
```

The validation gate runs the Rubric ESLint config, strict TypeScript checks, deterministic Featurette scene tests, coverage, built-package checks, and a package dry run.
