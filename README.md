# Pathfinder Sheet

A React web app for managing Pathfinder 1st Edition characters (and their companions), built
on Open Game Content from the Core Rulebook. IT/EN, light/dark theme, portable JSON saves.

> Questo progetto è in italiano nella UI di default e in inglese come alternativa — vedi
> `src/infrastructure/i18n/locales`. Le sezioni sotto sono in inglese per convenzione dei
> file README, ma l'app stessa mostra i propri contenuti in italiano o inglese a scelta.

## Features

- **Character sheet**: profile, ability scores, combat stats (AC/BAB/saves/CMB-CMD/HP/carrying
  capacity), skills, feats, inventory, spells, notes — all derived stats are computed live from
  the character's classes/race/abilities (see `src/domain`).
- **Companions**: Animal Companion, Familiar and Mount, each with their own sub-sheet, linked to
  a character. Adding a new companion kind is a one-file change (`src/domain/companion/registry.ts`)
  — no existing code needs to change.
- **New / Save / Load**: create a character, autosave to the browser (`localStorage`), and
  export/import a single character (with its companions) as a portable `.json` file.
- **Every destructive action asks for confirmation** (delete character/companion, overwrite on
  import) through one shared confirmation dialog (`useConfirm`).
- **IT/EN** via `react-i18next`; **light/dark theme** via a `.dark` class + CSS variables.

## Scope note on rules content

The bundled reference data (`src/content/**`) is a **starter set**, not the entire Pathfinder 1e
SRD: 7 core races, the 11 base classes with full level progressions, the full skill list, ~50
common feats, a starter list of cantrips/1st-level spells, common core weapons/armor/gear, and a
handful of companion base creatures. The data layer is organized so more content can be added
later without touching application logic. See [NOTICE.md](NOTICE.md) for the OGL attribution and
an accuracy disclaimer — some numeric tables (equipment costs, companion base stat blocks) are a
reference, not a transcription, and are worth double-checking against the book.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run test      # run unit tests (Vitest)
npm run lint      # ESLint
npm run typecheck # TypeScript, no emit
npm run build     # production build to dist/
```

## Architecture

```
src/
  domain/          # pure game-rule logic (types + calculations), framework-agnostic, unit-tested
  content/         # SRD reference data (races, classes, skills, feats, spells, equipment, companions)
  application/      # Zustand stores + use-cases (create/duplicate/export/import a character)
  infrastructure/  # persistence (localStorage autosave, JSON save-file schema) + i18n setup
  presentation/    # React UI: shared components, character-list and character-sheet features
```

Dependency direction is `presentation → application → domain`; `content` and `infrastructure`
are swappable details. See the project's design notes for the reasoning behind each choice
(companion registry for Open/Closed extensibility, shared `CreatureCore` calculations reused by
both characters and companions via composition, versioned JSON save schema, etc.).

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually) — `.github/workflows/deploy.yml`
   builds the app and publishes `dist/` to Pages, using `/<repo-name>/` as the base path automatically.

## License

Code: MIT, see [LICENSE](LICENSE). Rules data: Open Game Content, see [NOTICE.md](NOTICE.md).
