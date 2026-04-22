# Session: Bootstrap Script And README Overhaul

## What Was Done
- Added a cross-platform bootstrap entrypoint at `scripts/bootstrap.mjs`.
- Wired the script into `package.json` as `npm run bootstrap`.
- Reworked `README.md` into a contributor-first guide covering project status, repo layout, setup, environment handling, commands, and plan links.
- Added `docs/sessions/` and documented this session per the repo rules.
- Added `src/hooks/` as a checked-in placeholder so the documented repo structure matches the working tree.

## Decisions Made
- Kept `package-lock.json` as the reproducibility mechanism for dependencies rather than introducing another package manager.
- Made the bootstrap script validate Node from `package.json` engines and use `npm install`, not custom dependency logic.
- Made the bootstrap script create `.env` from `.env.example` only when missing, then fail clearly if Firebase values are still blank.
- Kept bootstrap limited to local setup. It does not provision Firebase, generate secrets, or mutate app code.

## Learnings
- This environment exposed Windows-specific `node` and `npm` resolution quirks. The bootstrap script therefore prefers `npm_execpath` when invoked from `npm run bootstrap` and falls back to `npm.cmd` on Windows.
- Reproducible setup is not just dependency pinning. The project already had `package-lock.json`, but fresh-machine setup was still fragile without a first-class entrypoint and explicit env-file behavior.
- The original `README.md` worked as a planning index, but contributors still needed a clearer map of the repo and the expected first-run workflow.
