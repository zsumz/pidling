export const CLI_HELP = `pidling - a short film for the terminal

Usage:
  pidling [options]

Movie options:
  --name <name>       override the shell name
  --no-name           do not look for a shell name
  --fast              play at 16x speed

Playback options:
  --scene <name>      start at one scene
  --speed <number>    set the playback speed
  --transcript        print the plain-text transcript
  --reduced-motion    collapse motion to final frames
  --skip              skip authored delays
  --no-color          disable color
  --no-unicode        use terminal-safe ASCII fallbacks
  --no-alt-screen     draw in the current screen
  --no-ansi           disable ANSI terminal controls
  -h, --help          show this help
`;
