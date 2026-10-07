# Changelog

## Unreleased

- Recorded Leanny's permission condition and added the required “Data provided by Lean” repository attribution in the app and project documentation.
- Recorded Sendouc's response permitting the requested 26-icon repository and website use without attribution to him, while preserving the separate Nintendo-rights boundary and `Leanny/splat3` source note.
- Removed the archived starter UI files after validation; recovery remains available from `dev-2026-09-06`.
- Split the representative game data into versioned main-weapon, sub-weapon, special-weapon, and weapon-kit tables with cross-reference validation.
- Added tested editor restoration rules for URL-first loading, local fallback, custom builds, and weapon changes.
- Added the first-party main-weapon parameter schema for the six representative weapons; unverified values remain empty and explicitly pending.
- Added a development-only main-weapon parameter audit table; production keeps only a concise verification notice.
- Verified the first six N-ZAP89 fields against the fixed 11.3.0 upstream snapshot, with field-level provenance and normalization notes; effective range remains pending.
- Added a verified N-ZAP89 main-weapon efficiency panel for full-tank shots, firing duration, shots to splat, ink per splat, and theoretical splat time.
- Verified five explicit Splattershot fields and made the efficiency panel reveal partial results without guessing its omitted firing interval.
- Corrected the third representative shooter from a mismatched Neo Splash-o-matic identity to the base Splash-o-matic, migrated legacy saved IDs, and verified six explicit fields.
- Added partial Splat Charger analysis from five verified fields, including full-charge damage, tank efficiency, charge storage, and travel distance without guessing the omitted charge time.
- Added Splat Roller analysis from eight verified fields, preserving separate swing, rolling-damage, speed, and variable per-frame ink-consumption semantics.
- Completed the six-weapon representative verification loop with Heavy Splatling charge stages, firing window, repeat interval, ink consumption, and a dedicated analysis panel.
- Fixed narrow-screen analysis layouts so all primary pages remain within a 390 px viewport instead of pushing the analysis column off-screen.
- Pinned the pnpm version used by the existing install and added a reproducible type-check script.

## 2026-09-06 — Local Data & Export UI

- Added a version-controlled INKLAB data registry with provenance and authorization status.
- Moved weapon records out of the UI layer and added schema validation.
- Moved optional PNG metadata to a collapsible panel on the analysis side.
- Added custom loadout slot replacement, local autosave, and share links.
- Added local PNG export and parameter verification states.
- Added automated coverage for abilities, loadouts, weapon context, sharing, export, and motion input.
- Archived unused starter components without permanently deleting them.

## 2026-09-01 — Initial Prototype

- Added the first INKLAB laboratory, ability index, player build sample, and motion experiment.
