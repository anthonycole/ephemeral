# Next.js + Radix UI Starter

This project is scaffolded for:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Radix UI Themes + Icons

## Run locally

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Local data store

The token workspace now persists through a local SQLite database via Drizzle.

```bash
pnpm db:generate
pnpm db:migrate
```

The database file is created at `data/ephemeral.sqlite`.

## Notes

`package-lock.json` may still exist from the initial npm bootstrap. You can remove it if you want a pnpm-only repo.
