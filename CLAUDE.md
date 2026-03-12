# Out Of Space — Session Onboarding

## What Is This?

**Out Of Space** is a macOS desktop app for visualising disk space usage in local directories. It renders interactive treemaps so users can quickly see what's consuming space.

- **Tech stack:** Electron + Vue 3 + D3.js
- **Target:** macOS (primary), portfolio showcase project
- **License:** MIT

## Key Documents

Read these to understand the project context:

| Document       | Purpose                                          | When to consult                        |
|----------------|--------------------------------------------------|----------------------------------------|
| `README.md`    | User-facing project overview, setup instructions | Before suggesting setup/run changes    |
| `DESIGN.md`    | Design decisions, scope, constraints, rationale  | Before proposing architecture changes  |
| `GOALS.md`     | High-level goals and progress checklist          | To understand current state & priorities|

## Conventions

- **Scope discipline:** v1 is visualisation-only plus "Show in Finder" / "Open in Terminal". No destructive file operations.
- **Platform:** Assume macOS unless otherwise noted.
- **Doc maintenance:** After completing a feature or making significant changes, check if README.md, DESIGN.md, or GOALS.md need updating. Keep them in sync with reality.

## Proposals for Future Sessions

- Consider adding an `ARCHITECTURE.md` once the codebase has enough structure to document (after Phase 1).
- The open questions in DESIGN.md should be resolved during the Step 2 planning session.
