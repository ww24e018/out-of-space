# Out Of Space — Session Onboarding

## What Is This?

**Out Of Space** is a macOS desktop app for visualising disk space usage in local directories. It renders interactive treemaps so users can quickly see what's consuming space.

- **Tech stack:** Electron + Vue 3 + D3.js + TypeScript
- **Build tooling:** electron-vite (single package.json, unified Vite config) + electron-builder
- **State management:** Pinia
- **Target:** macOS (primary), portfolio showcase project
- **License:** MIT

## Key Documents

Read these to understand the project context:

| Document       | Purpose                                          | When to consult                        |
|----------------|--------------------------------------------------|----------------------------------------|
| `README.md`    | User-facing project overview, setup instructions | Before suggesting setup/run changes    |
| `DESIGN.md`    | Design decisions, scope, constraints, rationale  | Before proposing architecture changes  |
| `GOALS.md`     | High-level goals and progress checklist          | To understand current state & priorities|

## Architecture

### Three code contexts

| Context    | Directory       | tsconfig           | Runs in         |
|------------|-----------------|--------------------|-----------------|
| Main       | `src/main/`     | `tsconfig.node.json` | Node.js (Electron main process) |
| Preload    | `src/preload/`  | `tsconfig.node.json` | Node.js (sandboxed bridge)      |
| Renderer   | `src/renderer/` | `tsconfig.web.json`  | Chromium (Vue 3 app)            |
| Shared     | `src/shared/`   | Both                 | Compiled independently per target |

### Path aliases

- `@shared/*` → `src/shared/*` (available in all contexts)
- `@/*` → `src/renderer/src/*` (renderer only)

### Shared types convention

`src/shared/` should contain **only types, interfaces, and string constants** — not classes or stateful code. Runtime values are independently bundled per process.

### IPC pattern

IPC channel names are defined as constants in `src/shared/ipc-channels.ts`. The preload script exposes a typed `window.api` object (defined in `src/shared/types.ts` as `ElectronApi`).

### Visualisation abstraction

`src/renderer/src/visualisation/` contains a shared interface (`types.ts`) and per-mode subdirectories (`treemap/`, `sunburst/`). All viz components share the same props/emits contract.

### Known Electron quirks (macOS)

- **`representedObject is not a WeakPtrToElectronMenuModelAsNSObject`** — Console warning triggered by clicking the Window menu. This is an upstream Electron/Cocoa menu integration issue, not caused by our code. Harmless (no functional impact). See [electron/electron#23778](https://github.com/electron/electron/pull/23778) for related context. Will resolve with a future Electron update — no action needed on our side.
- **`[DEP0180] fs.Stats constructor is deprecated`** — One-time deprecation warning from Node.js internals when `lstat` is called during directory scanning. Upstream Electron/Node issue, not caused by our code. Harmless — will resolve with a future Electron update.

## Conventions

- **Scope discipline:** v1 is visualisation-only plus "Show in Finder" / "Open in Terminal". No destructive file operations.
- **Platform:** Assume macOS unless otherwise noted.
- **Router:** Must use `createWebHashHistory()` (Electron requirement).
- **Dependencies:** Only main-process runtime externals go in `dependencies`. Everything else (including Vue, D3) is a `devDependency` since Vite bundles them into the renderer.
- **Doc maintenance:** After completing a feature or making significant changes, check if README.md, DESIGN.md, or GOALS.md need updating. Keep them in sync with reality.
- **Version pinning:** When specifying versions (Node.js, Electron, Actions, etc.) in CI configs, Dockerfiles, or plans, verify against actual release data (e.g. nodejs.org, releases.electronjs.org) rather than assuming from memory. Version landscapes shift frequently.

## Issue Tracking

We use **GitHub Issues** (via `gh`) as the shared backlog.

### Workflow

1. User reports observations from testing (expected vs. actual, errors, which action triggered it).
2. Claude asks clarifying questions if needed, then creates the issue.
3. One issue per distinct problem — easier to close and track.
4. **Always read issues with comments** (`gh issue view N --comments`): when starting work on an issue, when listing issues for prioritisation, or when an issue is referenced in conversation. Comments may contain decisions and context not present in the original description.

### Issue conventions

- **Titles:** Action-oriented ("Fix X when Y", not "Problem with Z") — keeps the backlog scannable.
- **Labels:** Use `bug`, `enhancement`, etc. to keep things sortable.
- **Content:** Include reproduction steps, relevant file paths, and error output where applicable.
- **Design decisions:** If something is a question or design choice rather than a bug, flag that distinction (use `discussion` label or similar).

### Branch ↔ Issue linking

- Reference issues in branch names: `bugfix/issue42-fix-treemap-resize`
- Reference issues in commit messages where relevant (`Fixes #42`, `Relates to #12`).

## Testing

- **Framework:** Vitest (renderer and shared code)
- **Test location:** `tests/vitest/` — Vitest's `include` is scoped here exclusively
- **Environment:** jsdom (global default; sufficient at current project scale)
- **Future:** `tests/node/` is reserved for Node's built-in test runner (not managed by Vitest)
- **Run:** `npm test` (single run), `npm run test:watch` (watch mode)
- **Mocking `window.api`:** Use `vi.stubGlobal('api', mockApi)` in renderer tests
- **Pinia in tests:** `setActivePinia(createPinia())` in `beforeEach` — no `@pinia/testing` needed
