# three-vr-editor

> ⚠️ You currently need an OpenRouter API key to make it work


`three-js-vr-builder` is an educational editor for learning three.js by writing, previewing, and iterating on scene code inside the app.

I built this project to help students work creatively with code.
The goal is not only to generate scenes, but to understand how three.js code, AI scaffolding, and smaller models actually work.
I also want to use smaller models on purpose. They should stay understandable, affordable, and replaceable.

This project is part of a collaboration with HTW Berlin and Futurium Lab.
If you want to contribute, send me a short note on GitHub. I would love more people to help build and explore this project. ✨

## What You Can Do

- `/editor`: write code, choose templates, preview scenes, and iterate with Pi
- `/chat`: use a separate chat surface with its own session scope
- `/settings`: configure your OpenRouter key and select a model

## Current Capabilities

- Managed editable scene files live under `static/three`.
- Starter templates live under `static/templates`.
- Scene files follow the shared `createDemoScene` contract.
- Scene files may optionally export `demoRendererKind = 'webgl' | 'webgpu'`.
- The preview runtime supports both `WebGLRenderer` and `WebGPURenderer`.
- Pi runs on the server only.
- Chat and editor share the configured key and model, but not the same session state.

## Quick Start 🚀

Install dependencies:

```sh
bun install
```

Start the development server:

```sh
bun run dev
```
`bun install` also runs `prepare`. That syncs SvelteKit and installs Playwright browsers for local test flows.

There is currently no required `.env` file for local development.
Keys, settings, and session files are stored outside the repository under `~/.three-js-vr-builder/pi`.

## Tech Stack

- `bun`
- `vite`
- `svelte 5` and `@sveltejs/kit`
- `three`
- `@mariozechner/pi-coding-agent`
- `bits-ui`
- `codemirror`
- `biome` for linting

## Project Structure 🧱

- `src/routes`: main app surfaces and supporting endpoints
- `src/lib/components`: reusable primitive UI families and thin Bits UI wrappers
- `src/lib/blocks`: composed UI blocks built from local primitives
- `src/lib/features/editor`: CodeMirror integration, preview runtime, workspace state, template helpers, and editor transport
- `src/lib/features/chat`: browser-side chat transport and conversation state
- `src/lib/server/editor`: managed file access, workspace bootstrap loading, template discovery, and preview bundling
- `src/lib/server/pi`: server-only Pi integration, auth, model selection, sessions, and tool orchestration
- `static/templates`: teaching-oriented starter templates
- `static/three`: local managed workspace for editable scene files
