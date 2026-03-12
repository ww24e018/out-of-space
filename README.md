# Out Of Space

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Visualise what's eating your disk space.** An interactive treemap explorer for local filesystem directories.

Built with Electron, Vue 3, and D3.

## Status

Early development — tech stack scaffolded, core features next.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type check
npm run typecheck

# Production build
npm run build
```

## Project Structure

```
src/
  main/              # Electron main process (app lifecycle, window management)
  preload/           # Preload scripts (IPC bridge between main and renderer)
  shared/            # Types and constants shared between main and renderer
  renderer/          # Vue 3 app (UI, visualisation)
    src/
      components/    # Reusable Vue components
      composables/   # Vue composables
      stores/        # Pinia stores
      views/         # Top-level views
      visualisation/ # D3 visualisation layer (treemap, sunburst)
```

## Features (Planned)

- Scan any local folder and visualise disk usage as an interactive treemap
- Switchable visualisation modes (treemap, sunburst)
- Drill down into subdirectories
- "Show in Finder" and "Open in Terminal" context actions
- macOS-first design

## Screenshots

> Coming soon.

## License

[MIT](LICENSE) — Copyright 2026 Florian Scholz
