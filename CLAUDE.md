# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build` (tsc -b && vite build)
- Dev: `npm run dev` (vite)
- Lint: `npm run lint` (eslint .)
- Preview: `npm run preview` (vite preview)

## Code Style
- TypeScript with strict type checking
- React 19 with functional components and hooks
- Path aliases: use `@/` prefix (mapped to `./src/*`)
- 2-space indentation
- Self-closing JSX tags
- Use `React.forwardRef` for component definitions
- Set explicit component display names
- Use shadcn/ui component patterns

## Type System
- Enable strict mode and noUnusedLocals/Parameters
- Define interfaces for component props
- Use type imports: `import type { X } from 'y'`

## Documentation
- Project specs in `/docs/spec.md`
- Workout log schema in `/docs/workout-log-schema.md`
- Example data in `/docs/example-log-file.md`