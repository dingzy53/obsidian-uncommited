# PLAN: QA audit fixes (uncommitted)

> Branch: `fix/qa-audit-fixes` (from `feat/e2e-testing`) · Date: 2026-11-24 · Status: Implemented and verified.

## Context & Findings

From `/Users/ding/GitHub/OBSIDIAN_PLUGINS_QA_REPORT.md`:

1. **BUG-02 (P1)**: **Discard all changes** silently does nothing when the note is open in Reading view (`preview` mode), yet shows a success Notice.
2. **BUG-09a (P3)**: Gutter badge truncates two-digit counts (`+…`).
3. **BUG-09b (P3)**: Untracked notes show `"Git: unavailable"` in the status bar and `"HEAD no commits yet"` in the diff panel even when the repository has commits (plus toggling **Show untracked files** fails to refresh open notes).
4. **BUG-09c (P3)**: Revert modal displays `"remove 1 added lines"` (missing singular/plural handling).
5. **BUG-09d (P3)**: Pressing `Enter` on a Changes list row moves focus into the editor, stopping arrow-key navigation after one step.
6. **Audit suggestion**: Merge the two ribbon icons into one (`open-changes-list` via `git-compare`).

## Verified Root Causes & Fix Design

1. **Discard in Reading view (`src/changes/discard.ts`)**: `openView` matched any `MarkdownView` regardless of mode, so `performDiscard` ran `editor.transaction` against the hidden inactive editor in Reading view. Restrict to `openEditView` (`view.getMode() === 'source' && view.containerEl.isShown()`) in both `capture()` and `performDiscard()` so Reading view falls through to `app.vault.process`.
2. **Gutter badge truncation (`styles.css`)**: Keep `.bmd-gutter-marker` fixed at `28px` (preserving `check-editor-stability.py` bounds and zero reflow) while reducing padding (`0 5px 0 1px`), adjusting `font-size: 10px`, and widening the arrow flat region (`clip-path: polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%)`) so 3-char badges (`+10`..`+99`) fit cleanly.
3. **Untracked baseline & status (`src/git.ts`, `src/store.ts`, `src/panel.ts`, `src/main.ts`)**: Attach `head` on `GitReadError('untracked', ...)`, propagate `untracked: true` and `reason` through `DiffStore` and `DiffPanel` (`Untracked` vs `Newly tracked`, `Git: untracked` vs `Git: unavailable`), and compare against `appliedShowUntracked` in `saveChangesSettings()`.
4. **Pluralization (`src/revert-modal.ts`, `src/panel.ts`)**: Pluralize `line`/`lines` for both added and deleted counts.
5. **List keyboard focus (`src/changes/open.ts`, `src/changes/index.ts`, `src/changes/changes-view.ts`, `src/main.ts`)**: Support `{ focus?: boolean }` when opening from the Changes list (`focus: false` in `installChanges` while keeping `ChangesViewHost.open(file)` single-argument), pass `{ active: focus }` to `openFile`/`setViewState`/`ensureSideLeaf`, and re-focus the row after `Enter`/`Space` activation.
6. **Single ribbon icon (`src/main.ts`, `scripts/host-smoke.py`, `AGENTS.md`)**: Remove the redundant upstream `file-diff` ribbon icon (keeping `git-compare`).

## Order of Work

1. `[x]` Fix Reading-view discard (`src/changes/discard.ts`) and add unit tests.
2. `[x]` Fix gutter badge CSS (`styles.css`), untracked baseline/status/settings refresh (`src/git.ts`, `src/store.ts`, `src/panel.ts`, `src/main.ts`), and revert modal pluralization (`src/revert-modal.ts`).
3. `[x]` Fix Changes list `Enter` focus retention (`src/changes/open.ts`, `src/changes/index.ts`, `src/changes/changes-view.ts`, `src/main.ts`) and remove redundant ribbon icon (`src/main.ts`, `scripts/host-smoke.py`, `AGENTS.md`).
4. `[x]` Update and expand unit tests, run `npm run check && npm run check:mobile`, mark plan verified, and push `fix/qa-audit-fixes`.

## Verification Plan

- `npm run check` (`check:english`, `lint` with `--max-warnings 0`, `test`, `build`, `check:release`)
- `npm run check:mobile`
