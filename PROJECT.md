# Earth Beat

## Product

Earth Beat is the Earth Information Jukebox: an accessible, multi-sensory way to explore Earth Information Center (EIC) visual frames and Earth science data. It pairs visual context with live sonification so that a trend can be understood by listening as well as looking.

The prototype demonstrates signal selection, a changing visualization, English/Burmese UI, and user-started audio. Its current readings are generated demonstration values. They must not be represented as NASA measurements. The production app should display dataset provenance, temporal and geographic coverage, units, and any processing applied to each signal.

## Repository topology

Maintain four independent GitHub repositories. Each product repository has its own Git history, dependencies, CI, README, and license. The root repository is an integration superproject that tracks the three projects as Git submodules; do not copy their source into the root repository.

| Repository          | Purpose                              | Default GitHub visibility                                                  |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `earth-beat-app`    | Browser experience                   | Public unless the user explicitly requests private                         |
| `earth-beat-api`    | HTTP API and persistence             | Confirm with the user if not specified                                     |
| `earth-beat-mobile` | iOS and Android experience           | Confirm with the user if not specified                                     |
| `earth-beat`        | Documentation and submodule pointers | Confirm visibility; make sure it does not expose private source or secrets |

The root README explains each project, links to its standalone repository, and documents clone-with-submodules commands. Each submodule points to a stable commit in its own remote. Root changes and product changes are committed and published independently. Never include credentials or tokens in a remote URL, submodule config, committed file, or example environment file.

## Target stack

### App: `earth-beat-app`

- React with React Router for routing.
- TanStack Query (React Query) for server state, caching, and request lifecycle.
- shadcn/ui initialized with preset `beEhfqy2`; preserve the generated design tokens and component conventions.
- Responsive, keyboard-accessible data exploration and sonification studio.
- Language-aware localization. English and Burmese must have separate typography behavior; see `.github/skills/burmese-i18n/SKILL.md`.

### API: `earth-beat-api`

- Node.js, Express, SQLite, Prisma 7, and JWT-based authentication.
- Versioned, validated API contracts consumed by the app and mobile client.
- Seed a substantial, deterministic sample dataset so common screens and filters are useful without external credentials or live NASA services. Clearly identify generated sample records and keep them distinct from sourced science data.
- Store passwords using an appropriate password hash; keep JWT signing secrets in environment configuration, set expiry, validate authorization server-side, and never treat a client-held token as proof of permissions.

### Mobile: `earth-beat-mobile`

- React Native with Expo.
- Share product language and API contracts with the app while keeping the mobile repository independently installable, testable, and releasable.
- Support accessible playback controls and a clear state when audio is unavailable or interrupted.

## Product behavior

The central workflow is: choose an Earth signal and region/time range; inspect its visual frame and metadata; hear the selected signal; adjust or compare the mapping; and understand what the sound represents. The UI must label generated, cached, unavailable, and live data states accurately. A real-time source is not assumed until its provider, licensing, update cadence, and fallback behavior are selected.

Sonification should use explainable mappings (for example, value to pitch and rate of change to pulse). Users must be able to start, pause, and stop audio; control volume; identify the active signal; and use the experience without sound. Avoid audio autoplay and provide reduced-motion support.

## Localization and accessibility

- Start with English and Burmese, with locale selection reflected in the document language.
- Keep established technical vocabulary and familiar UI terms in English when translation would be less recognizable; do not mechanically translate every English term.
- Burmese text must not inherit English letter spacing or a fixed compact line height. Use Myanmar-capable fonts and language-specific line-height/spacing rules.
- Give controls accessible names, keyboard focus, visible states, and non-color-only signal distinctions. Do not encode critical data solely in audio, color, or motion.

## Source publishing checklist

1. Confirm repository names, GitHub organization/account, and visibility before creating or publishing repositories. Keep `earth-beat-app` public unless the user explicitly requests private. Do not infer permission to expose API, mobile, or root repositories from the app's visibility.
2. Give each of the four repositories an accurate README and an appropriate license before its first public release. Confirm that imagery, datasets, dependencies, and contributions are compatible with those licenses.
3. Keep app, API, and mobile as separate repositories with their own package manifests, tests, CI, issues, and releases. Initialize the root repository separately and add the projects as submodules.
4. Use HTTPS or SSH remotes without embedded credentials. Check for secrets, private data, generated build output, and misleading NASA attribution before every publish.
5. Verify clean install, lint, tests, and production build in each project independently; verify that a fresh recursive clone initializes all intended submodules.

## Decisions to confirm before production implementation

- Which EIC/NASA data sources and visual frames should the first release support, and what is the preferred live-data fallback?
- Which Earth variables, geographic regions, and time ranges are in the first release?
- Should accounts be required, and which user preferences or saved explorations need persistence?
- What GitHub account or organization and visibility should be used for the API, mobile, and root repositories?
- Which license should be applied to the product source and documentation?
