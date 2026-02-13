# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Windows disk cleanup desktop tool built with Electron + Vue 3 + TypeScript. It runs a PowerShell script (`CleanUp.ps1`) to clean 12 categories of system junk (temp files, recycle bin, DNS cache, etc.) and displays real-time progress and logs in a GUI.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev environment (electron-vite dev) |
| `npm run build` | Typecheck + production build |
| `npm run build:ci` | Production build without typecheck |
| `npm run build:win` | Build + package Windows installer |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | Run both node and web type checks |
| `npm run typecheck:node` | TypeScript check for main/preload (`tsconfig.node.json`) |
| `npm run typecheck:web` | Vue-tsc check for renderer (`tsconfig.web.json`) |

## Architecture

**Electron three-process model** using `electron-vite`:

- **Main process** (`src/main/index.ts`): Creates the BrowserWindow, sets up IPC handler for `start-cleanup` channel. Spawns PowerShell to execute `CleanUp.ps1`, streams stdout/stderr line-by-line back to renderer via `cleanup-output` and `cleanup-complete` IPC events. Handles script path resolution differently for dev vs production (app root vs `process.resourcesPath`).

- **Preload** (`src/preload/index.ts`): Exposes `window.api` with three methods: `startCleanup()`, `onCleanupOutput(cb)`, `onCleanupComplete(cb)`. The `on*` methods return unsubscribe functions.

- **Renderer** (`src/renderer/`): Vue 3 SFC app with `<script setup>` and Composition API. Path alias `@renderer` → `src/renderer/src`.
  - `useCleanup` composable (`composables/useCleanup.ts`): Core logic — parses PowerShell output lines using prefix patterns (`[OK]`, `[--]`, `[!!]`) to update each clean item's status, and extracts freed space from the summary line.
  - Components: `TitleBar`, `CleanItemList`, `ActionPanel` (start button + log viewer), `StatusBar`.
  - Types in `types.ts`: `CleanStatus` = `'pending' | 'running' | 'success' | 'skipped' | 'warning'`, `CleanItem` interface.

**PowerShell script** (`CleanUp.ps1`): Bundled as an `extraResource` in electron-builder. Output format conventions: `[OK]` = success, `[--]` = skipped, `[!!]` = warning. Summary line contains `共释放约 X MB`.

## Key Conventions

- UI text and PowerShell output are in Chinese (zh-CN)
- The app requires admin privileges for full cleanup capability
- `electron-builder.yml` configures packaging; `CleanUp.ps1` is copied via `extraResources`
- ESLint config uses flat config format (`eslint.config.mjs`) with `@electron-toolkit` presets
