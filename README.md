# HUNDatfuenfazwanzg3

A modern web application for managing a dog training community. The app streamlines day‑to‑day operations: member management, course credits and attendance, and cantina sales (POS‑style) for wares (drinks and food).

---

## Overview

HUNDatfuenfazwanzg3 (HFZ) helps clubs and communities:
- Keep an up‑to‑date member directory
- Track course packages and how many sessions each member has left
- Record training participation and history
- Run a lightweight cantina/merchandise point‑of‑sale for wares (drinks and food) and track balances

The goal is to reduce admin overhead while giving trainers and organizers clear, real‑time insights.

---

## Core Features

- Members
  - Create, edit, search members
  - View a member’s profile, history, and transactions
- Courses & Credits
  - Assign course packages and track remaining sessions
  - Record course attendance and usage
- Cantina Sales (POS)
  - Manage wares/items with prices
  - Record sales to members, see running history
- History & Reporting
  - Per‑member history of sales, attendance, and changes
  - Overview screens for admins/trainers

---

## Tech Stack

- SvelteKit (Svelte) frontend application
- TypeScript throughout the codebase
- Vite for dev/build tooling
- Prettier/ESLint for code quality

Note: Some modules reference a backend API (e.g., Supabase). Use `.env.example` as the source of truth for required environment variables and create your `.env` accordingly.

---

## Getting Started

### Prerequisites
- Node.js 20+ (recommended)
- pnpm or npm (examples use npm)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# Optionally open in a browser automatically
npm run dev -- --open
```

### Build
```bash
npm run build
```

### Preview (production build)
```bash
npm run preview
```

### Lint & Format
```bash
npm run lint
npm run format
```

---

## Configuration

Environment variables are defined via `.env` files.
- Use `.env.example` as the source of truth for required variables
- Copy it to `.env` and fill in the values for your environment
- Common examples: public API base URLs, Supabase (or other backend) keys/URLs

Do not rely on code files to infer env requirements; always refer to `.env.example`.

---

## Project Structure (high level)

- `src/`
  - `routes/` — SvelteKit routes and pages
  - `lib/` — shared components, data access, utilities
  - `lib/components/` — UI components (e.g., wares/POS components, navigation)
  - `lib/data/` — API/data helpers
- `static/` — static assets
- `todos.md` — internal roadmap/notes

---

## Contributing

Contributions and feedback are welcome! If you plan a larger change:
- Open an issue to discuss your idea
- Keep PRs focused and small where possible
- Follow existing code style (ESLint/Prettier)

---

## Roadmap / Notes

See `todos.md` for current tasks and ideas.

---

## License

This project is licensed under the terms specified in the repository (add or update a LICENSE file if needed).

---

## Contact

If you have questions, suggestions, or run into issues, please open a GitHub issue or contact the maintainer.
