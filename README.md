# Home Game Officials

A web application to manage game officials (toimitsijat) for basketball home games. Import games from eLSA Excel files (https://github.com/kirkkala/elsa-myclub / https://elsa-myclub.vercel.app/) and assign officials to each game.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Material UI 7** (MUI) for components and styling
- **Drizzle ORM** + **Neon postgres** for database
- **xlsx** (SheetJS) for Excel processing
- **Jest** + **Testing Library** for tests
- **Biome** for lint and format

### Prerequisites

- Node.js 24 (with nvm)
- pnpm

## Project Structure

```
homegame-officials/
├── __tests__/              # Project jest tests
├── app/                    # Next.js App Router
│   ├── api/                # API routes (games, players)
│   ├── hallinta/           # Admin page (import, manage)
│   └── page.tsx            # Main games list page
├── src/
│   ├── components/         # React components
│   ├── db/                 # Drizzle schema & config
│   ├── lib/                # Utilities (Excel parser, storage)
│   └── theme/              # MUI theme configuration
└── public/                 # Static assets
```

## How It Works

The application helps basketball team managers assign officials to home games:

1. **Import Games**: Upload eLSA Excel export to import home games
2. **Manage Players**: Add players who can serve as officials
3. **Assign Officials**: Assign players to games as "pöytäkirja" (scorekeeper) or "kello" (clock operator)

**Input**: eLSA Excel export with game schedule (date, time, venue, teams, division)

**Output**: Organized list of home games with assigned officials

## Development

### Local Database Setup

Start a local Postgres database with Docker:

```bash
# Note the correct postrgres version, match with one at Vercel
docker run --name homegame-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:17
```

Create a `.env.local` file:

```bash
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/postgres"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
ADMIN_EMAIL=
```

Auth notes:

- `AUTH_SECRET` is required by Auth.js. Generate it with `npx auth secret`.
- `ADMIN_EMAIL` grants admin privileges to the matching user email.

Push the database schema:

```bash
pnpm db:push
```

To push schema changes to **Vercel**, set `POSTGRES_URL` to your Vercel database URL (from Vercel Dashboard → Storage → your database → `.env.local`) and then run `pnpm db:push`. The command targets whatever database `POSTGRES_URL` points to.
Might need to `NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm db:push`

To stop/start the database later:

```bash
docker stop homegame-postgres   # Stop
docker start homegame-postgres  # Start again
```

### Install & Run

```bash
pnpm install         # Install dependencies
pnpm dev             # Start dev server at http://localhost:3000
```

### Available Scripts

```bash
pnpm run help       # List all scripts and what they do
```

Key commands: `dev`, `build`, `start`, `lint`, `lint:fix`, `test`, `test:watch`

### Database Scripts

```bash
pnpm db:generate     # Generate migrations
pnpm db:migrate      # Run migrations
pnpm db:push         # Push schema to database
pnpm db:studio       # Open Drizzle Studio
```

### Copy Production Database to Local

Get `DATABASE_URL` URL from Vercel Dashboard → Storage → Neon.

```bash
export HOMEGAME_OFFICIALS_PROD_DB="postgresql://user:pass@ep-xxx.pooler.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Dump to a file (Docker ensure pg_dump is available, could also use pg_dump installed with e.g. homebrew)
docker run --rm postgres:17 pg_dump "$HOMEGAME_OFFICIALS_PROD_DB" > prod-backup.sql

# Import to local container
docker exec -i homegame-postgres psql -U postgres < prod-backup.sql
```

To clear local database:

```bash
docker exec -i homegame-postgres psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Deployment

Github Actions and Vercel CI does all magic.

* Git push and create PR -> development environment.
* Merge to main -> production deployment
    * Create tag after deploy

## Credits

Created by [Timo Kirkkala](https://github.com/kirkkala) to help basketball team managers organize game officials for home games.
