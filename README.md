# Earth Beat

Earth Beat is an Earth Information Jukebox: a bilingual demo that pairs an Earth visual frame with a real-time sonification interface. The current workspace is a design prototype; the target product is specified in [PROJECT.md](PROJECT.md) as three independent repositories.

## Run the demo

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Next.js. Choose Temperature, Ocean, or Forest, then start playback to hear the signal mapped to changing pitch and pulse.

The current readings and waveform are generated demo data, not live NASA observations. Audio begins only after an explicit user action. The Earth image is NASA Blue Marble imagery.

## Project structure

- `src/app`: current demo shell and route
- `.github/skills/burmese-i18n`: workspace-local Burmese localization and typography guidance
- `.github/skills/project-publisher`: workspace-local multi-repository creation and publishing workflow
- `PROJECT.md`: product scope, target stack, repository layout, and publishing requirements

## License

The license for this prototype is to be selected before public release. Each future project repository and the root superproject must include its own appropriate license and README.
