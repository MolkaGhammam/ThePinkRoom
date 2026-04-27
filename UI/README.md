# UI — Drop-in Design Kit

This folder is **everything an AI agent needs** to build your real Next.js + TypeScript project's UI in the Pink Room visual language.

## How to use it

1. **Copy the entire `UI/` folder** into the root of your real project.
2. Tell the AI agent (Claude Code, Cursor, etc.):

   > Read `UI/instructions.md` and follow it.

That's it. The agent will:
- Move `UI/design-kit/` to the project root.
- Wire Tailwind, fonts (Plus Jakarta Sans + Fraunces via `next/font`), `globals.css`, and the `@kit` path alias using the templates in `UI/config-templates/`.
- Build screens by composing components from `@kit`.

## What's inside

- **`design-kit/`** — the actual library (tokens, primitives, compounds, catalog docs, `CLAUDE.md`).
- **`examples/`** — full screen references (HomePage, DatePage, ShowcasePage). Read-only patterns.
- **`config-templates/`** — Next.js App Router config files to copy or merge into your project.
- **`instructions.md`** — the canonical entry point for the AI agent. Read it yourself once if you want to know what the agent is going to do.

## Stack assumed

Next.js 14+ (App Router) + TypeScript + Tailwind CSS 3. If you are on a different stack, the agent will need a hint.
