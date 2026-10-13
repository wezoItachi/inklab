# Changelog

## Unreleased

- Recorded Leanny's permission condition and added the required “Data provided by Lean” repository attribution in the app and project documentation.
- Recorded Sendouc's response permitting the requested 26-icon repository and website use without attribution to him, while preserving the separate Nintendo-rights boundary and `Leanny/splat3` source note.
- Adopted AGPL-3.0-only for INKLAB-owned code before the first public release, added an in-product source/license notice, and kept third-party data and assets outside that code license.
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
- Replaced the static player-build mockup with a validated example library, search, share links, and one-click editing in the lab.
- Imported the complete 174-weapon Ver. 11.3.0 catalog with all 14 sub weapons, 19 special weapons, and kit relationships, preserving existing verified records and leaving untouched classes explicitly pending.
- Imported explicit source-backed fields for all 40 shooter weapons from 14 shared Ver. 11.3.0 parameter classes, while leaving omitted defaults and range definitions pending.
- Imported explicit fields for all 17 blasters from 7 shared parameter classes and added a dedicated direct-hit/blast analysis panel, including separate S-BLAST jump-blast provenance.
- Fixed full-catalog analysis routing so newly imported shooters cannot be rendered with charger, roller, or splatling terminology merely because their field names overlap.
- Imported explicit fields for all 14 rollers from 5 shared parameter classes, separating horizontal and vertical swing ink costs and keeping complete repeat intervals pending.
- Imported explicit fields for all 19 chargers from 8 shared parameter classes, preserving omitted charge-time and charge-storage defaults as pending instead of borrowing values across weapon classes.
- Imported explicit source-backed fields for the remaining 83 pending battle weapons across Brush, Slosher, Spinner, Maneuver, Shelter, Stringer, and Saber families; the 84 processed records include the previously reviewed Heavy Splatling, now normalized with its shared class.
- Audited all 174 battle-weapon display names against the fixed Simplified Chinese localization and an independent current catalog, then added import and test guards against placeholder or non-normalized names.
- Replaced the three global quick-build templates in the lab with deterministic per-weapon system suggestions for main, sub, and special directions, including visible evidence and an explicit boundary from future external and beta samples.
- Added a second-level recommendation source switch for system suggestions and future player samples, including honest empty states and 20/50/100 unique-player confidence thresholds.
- Reorganized the ability-fragment picker into gear-part tabs and ability-category filters, while hiding part-exclusive abilities from invalid gear and additional slots.
- Replaced weapon dropdowns with a shared searchable picker and added text-first weapon-kit presentation so unlicensed images can remain absent without blocking the interface.
- Added the 71-weapon Salmon Run laboratory, live rotation names, first three traceable `_Coop` DPS samples, synchronized/staggered refill models, and a custom-health target experiment with explicit model boundaries.
- Documented the work that can reach public-readiness without new images and separated future Lean data/image questions from community, platform, and Nintendo rights.
- Removed the unintended player-scheme rarity, brand, and equipped-ability facets while preserving the combined scheme-tag, battle-mode, and weapon filters.
- Confirmed Web-only as the permanent product scope: desktop and mobile browsers share one responsive site, with native apps, desktop wrappers, PWA packaging, and installers removed from the roadmap.
- Recorded the permanent free/open-source principle: future sponsorship may only support operating resources and will not unlock features, quotas, data access, ranking, or review privileges.
- Split Salmon Run pressure testing into verified theoretical-limit and explicit routine-action baselines, using Tri-Stringer's one-ring charge as the first nontrivial maximum-DPS case and excluding sub/special weapons.
- Removed the unverified two-second Salmon Run refill assumption from displayed results; target experiments now show fractional damage equivalents and real discrete action counts while sustained DPS waits for recovery and ink-lock verification.
- Added public-release, privacy, security, disclaimer, and design-language documentation for the Web-only open-source launch path.

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
