# Home Game Officials

A web application to manage game officials (toimitsijat) for basketball home games. Import games from eLSA Excel files (https://github.com/kirkkala/elsa-myclub / https://elsa-myclub.vercel.app/) and assign officials to each game.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Material UI 7** (MUI) for components and styling
- **Drizzle ORM** + **Vercel Postgres** for database
- **xlsx** (SheetJS) for Excel processing
- **ESLint** + **Prettier** for code quality

### Prerequisites

- Node.js 20+
- pnpm

## Project Structure

```
homegame-officials/
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
docker run --name homegame-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Create a `.env.local` file:

```bash
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/postgres"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Push the database schema:

```bash
pnpm db:push
```

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
pnpm dev             # Development server
pnpm build           # Production build
pnpm start           # Production server
pnpm lint            # Check linting
pnpm format          # Format with Prettier
pnpm format:check    # Check formatting
```

### Database Scripts

```bash
pnpm db:generate     # Generate migrations
pnpm db:migrate      # Run migrations
pnpm db:push         # Push schema to database
pnpm db:studio       # Open Drizzle Studio
```

### Copy Production Database to Local

1. Get the database URL from Vercel Dashboard → Storage → your database → `.env.local` tab
2. Remove `&supa=base-pooler.x` from the URL (pg_dump doesn't understand it)

```bash
# Set the production URL (remove &supa=...)
export HOMEGAME_OFFICIALS_PROD_DB="postgres://user:pass@host:6543/postgres?sslmode=require"

# Dump production to file (use postgres:17 to match Vercel's version)
docker run --rm postgres:17 pg_dump "$HOMEGAME_OFFICIALS_PROD_DB" > prod-backup.sql

# Import to local Docker
docker exec -i homegame-postgres psql -U postgres < prod-backup.sql
```

To clear local database first (fresh copy):

```bash
docker exec -i homegame-postgres psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Deployment

Deploy to Vercel with Vercel Postgres:

```bash
vercel --prod
```

## Code Quality

```bash
pnpm lint            # Check for issues
pnpm format          # Format with Prettier
pnpm format:check    # Check formatting
```

## Credits

Created by [Timo Kirkkala](https://github.com/kirkkala) to help basketball team managers organize game officials for home games.
