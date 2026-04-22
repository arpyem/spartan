# Session: Codex Shell Setup Notes

## What Was Done
- Verified the working Node installation at `C:\Program Files\nodejs`.
- Confirmed repo validation succeeds with `cmd /c npm test -- --run` and `cmd /c npm run build`.
- Updated `AGENTS.md` with Codex-on-Windows guidance for Node and npm command usage.

## Decisions Made
- Standardized on `cmd /c npm ...` for Codex PowerShell sessions instead of plain `npm ...`.
- Documented `spawn EPERM` from `esbuild` as a likely sandbox restriction in Codex rather than a default signal that Vite or the repo is broken.

## Learnings
- PowerShell may resolve `npm` to `npm.ps1`, which can fail under the default execution policy even when `npm.cmd` works.
- A stale Codex session can keep an outdated `PATH` after Node is installed; restarting the session is the first fix.
- In this environment, Vite and Vitest can require escalated execution because `esbuild` spawns child processes that do not always run inside the sandbox.
