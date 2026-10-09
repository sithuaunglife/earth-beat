# Earth Beat — Earth Information Jukebox

Earth Beat is an English-only interactive demo for NASA Space Apps' The Earth Information Jukebox challenge.

## Run it

Open index.html in a modern browser. Click Start listening to enable Web Audio. No build step or external API is required.

## What is included

- Production-style Earth Beat visual identity and responsive layout.
- Four directly clickable sound scenes: Temperature, Rainfall, Vegetation, and Ocean.
- Figma-inspired pixel-art Earth mascot and deep-space nebula backdrop.
- Animated Earth-inspired visual stage and live signal canvas.
- Web Audio sonification for every scene.
- Each scene has its own pitch range, waveform behavior, color, and data mapping.
- Temperature uses a tonal voice, rainfall uses pulsing filtered noise, vegetation uses harmonic shimmer, and ocean uses a low swell plus noise.
- Accessible controls for scene selection, start/stop, mute, volume, reset, and keyboard navigation.
- Separate Stop listening and Mute controls plus an animated activity wave that pauses when stopped or muted.
- Stop fully clears the timer, disconnects/stops audio nodes, and closes the AudioContext so no background sound continues.
- Figma assets are stored locally as earth-pixel.png and space-nebula.png; no temporary Figma asset URLs are used.
- Explicit NASA EIC, demo-data, and challenge-alignment labeling.

## Important demo note

The current signal is simulated so the experience is dependable during judging. Replace the signal function and visual frame with a verified NASA EIC dataset when the API/data layer is ready.

## Recommended demo flow

1. Click Temperature, then Start listening.
2. Click Rainfall, Vegetation, and Ocean to hear the sound change immediately.
3. Point out the live pitch, value, waveform, and color change.
4. Explain the mapping card for the selected Earth system.
5. Open the challenge brief link for source alignment.

Official challenge: https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/
