<p align="center">
  <img src="./pidling-logo.svg" alt="pidling - a Featurette short" width="720">
</p>

<p align="center">
  <strong>A small process gets one run.</strong>
</p>

<p align="center">
  A terminal-native short film about what it decides to do with the time.
</p>

<p align="center">
  <a href="#run">Run</a>
  <span> · </span>
  <a href="#playback">Playback</a>
  <span> · </span>
  <a href="#develop">Develop</a>
</p>

<br />

## Run

```sh
npm install
npm start
```

Pidling plays in the terminal, then returns control when the film ends.

## Playback

```sh
npm start -- --fast
npm start -- --transcript
npm start -- --name Ada
```

Pidling may use a shallow name from your shell account. Use `--name <name>` to override it or `--no-name` to opt out.

The visual film needs at least `48x16`. Smaller terminals receive the transcript; resizing during playback becomes part of the scene. The first `Ctrl+C` gives the process one last sentence, and the second exits immediately.

Run `npm start -- --help` for every playback option.

## Develop

```sh
npm run validate
```

Built with [Featurette](https://github.com/zsumz/featurette).
