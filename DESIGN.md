# Design — Out Of Space

## Vision

A lightweight desktop app that scans a local directory and presents an interactive treemap visualisation of disk usage, making it easy to spot what's consuming space.

## Target Platform

- **Primary:** macOS
- **Future consideration:** Cross-platform (Windows, Linux) via Electron, but not an initial goal

## Audience

- Personal use (developer & general macOS user)
- Portfolio showcase demonstrating Electron + Vue 3 + D3 skills

## Tech Stack

| Layer          | Technology       | Notes                              |
|----------------|------------------|------------------------------------|
| Shell          | Electron         | Desktop app, native OS integration |
| UI Framework   | Vue 3            | Composition API, SFC               |
| Visualisation  | D3.js            | Treemap layout + rendering         |
| Build tooling  | electron-vite    | Unified Vite config for all targets|
| Packaging      | electron-builder | macOS .dmg + .zip                  |
| State          | Pinia            | Vue's official store               |
| Language       | TypeScript       | Strict mode, 3 tsconfig files      |

### Why This Stack?

- **Electron** — provides filesystem access, native menus, "Show in Finder" / "Open in Terminal" integration, and cross-platform potential. Mature ecosystem for desktop apps.
- **Vue 3** — lightweight, approachable, excellent DX with Composition API. Good fit for a single-developer project.
- **D3** — the gold standard for custom, interactive data visualisation in the browser. Treemap layout is a first-class citizen in D3-hierarchy.

## Scope — v1

### In Scope

- Select a folder to scan
- Recursive directory scanning with size aggregation
- Interactive treemap visualisation (zoom, hover, breadcrumb navigation)
- Context actions on selected items:
  - "Show in Finder" (macOS `open -R`)
  - "Open in Terminal" (launch terminal at directory)
- Sensible loading/progress indication during scan

### Out of Scope (Explicit)

- **Destructive file operations** — no delete, move, or rename from within the app
- **Usage history / snapshots** — no tracking changes over time
- **Cloud / network storage** — local filesystem only
- **Windows / Linux support** — not targeted for v1, though Electron makes it feasible later

## Constraints

- Must handle large directory trees (100k+ files) without freezing the UI — scanning should be async / off the main thread
- Visualisation should remain responsive during interaction (zooming, hovering)
- No elevated permissions required — scan only what the user's account can read

## Resolved Decisions (Step 2)

- **Build tooling:** electron-vite (alex8088) — single `package.json`, unified Vite config with 3 targets (main, preload, renderer)
- **State management:** Pinia from the start
- **Visualisation:** Switchable modes — treemap (primary) + sunburst, sharing a common component interface
- **Shared types:** `src/shared/` directory with path aliases, types-and-constants only (no runtime state)

## Open Questions

- Filesystem scanning strategy (Node.js `fs.readdir` recursive, or a native addon for speed?)
- Colour scheme for file types in visualisations
