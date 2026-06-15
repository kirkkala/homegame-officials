# Home Game Officials

Manage game officials (toimitsijat) for basketball junior division serie games.

Supports importing games from eLSA Excel files (https://github.com/kirkkala/elsa-myclub / https://elsa-myclub.vercel.app/) and help with assigning officials for each game.

Has also team First aid kit bag tracker (who currently has the bag it). Reduces unnecessary messaging, questions and confusion.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Material UI 7** (MUI) for components and styling
- **Drizzle ORM** + **Neon postgres** for database
- **xlsx** (SheetJS) for Excel processing
- **Vitest** + **Testing Library** for tests
- **Biome** for lint and format

### Prerequisites

- Node.js 24 (with nvm)
- pnpm

## Project Structure

```
homegame-officials/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (games, players, first-aid-bags, auth, etc.)
│   ├── ensiapulaukut/      # First aid bags page
│   ├── hallinta/           # Admin page (import, manage)
│   ├── kayttoohjeet/       # Usage instructions
│   ├── kirjaudu/           # Login page
│   ├── tietosuoja/         # Privacy policy
│   └── page.tsx            # Main games list page
├── src/
│   ├── components/         # React components
│   ├── db/                 # Drizzle schema & config
│   ├── hooks/              # Custom hooks (e.g. useFirstAidBags)
│   ├── lib/                # Utilities (Excel parser, storage, API client)
│   └── theme/              # MUI theme configuration
└── public/                 # Static assets
```

## How It Works

1. **Log in and create team**
    * Log in with Gmail address and create your team
    * You will be the administrator, you can add other Gmail users as team admins too
2. **Import Games**
    * Import games from an eLSA Excel export file
    * The file can be created with https://elsa-myclub.hnmky.fi
2. **Manage Players**
    * Add players to your team.
3. **Assign Officials**
    * Assign players to games as "pöytäkirja" (scorekeeper) or "kello" (clock operator)
    * The parent of named player is responsible for the officials shift
    * The app can be used by team manager or members of the team
4. **Track First aid kit bags**
    * Manager add the number of First aid kits in the team
    * Team members can mark who currently has each Fist aid kit    

## Development

### Local Database Setup

Start local Postgres:

```bash
docker run --name homegame-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:17
```

Create `.env.local`

```bash
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/postgres"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
ADMIN_EMAIL=
```

Auth notes:

- `AUTH_SECRET` is required by Auth.js. Generate it with `npx auth secret`.
- `ADMIN_EMAIL` grants full admin privileges to the matching user email.

Push the database schema:

```bash
pnpm db:push
```

**To push schema to preview or production**
* Set `POSTGRES_URL` to that database URL (Neon or Vercel Dashboard → Storage → `.env.local`)
* Run `pnpm db:push`.
* Might need to `NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm db:push`


**Stop/start local db later**
```bash
docker stop homegame-postgres
docker start homegame-postgres
```

### Install & Run

```bash
pnpm i
pnpm dev
```

### Available Scripts

```bash
pnpm run help       # List all scripts and what they do
```

## Environments

Preview deployments should not use the production database.

| | Runs on | Database |
| --- | --- | --- |
| Local | `pnpm dev` | Docker Postgres |
| Preview | Vercel PR | Neon branch `preview` (shared by all previews) |
| Production | Vercel `main` | Neon branch `main` |

* **Neon**
    * Branches → create `preview` from `main`
    * Copy connection string
    * Refresh data: Branches → `preview` → **Reset from parent**.

* **Vercel**
    * Settings → Environment Variables: `POSTGRES_URL`
        * Scope prod URL to **Production**, preview branch URL to **Preview** only.
    * Google login on previews needs that deployment's callback URL in [Google Cloud Console](https://console.cloud.google.com/).

* **Schema**
    * `pnpm db:push` on local, then preview URL, then production after merge.

#### Copy production database

```bash
export HOMEGAME_OFFICIALS_PROD_DB="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
export HOMEGAME_OFFICIALS_PREVIEW_DB="postgresql://user:pass@ep-yyy-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

#### Dump (Docker ensures pg_dump is available)
```bash
docker run --rm postgres:17 pg_dump "$HOMEGAME_OFFICIALS_PROD_DB" > prod-backup.sql
````
#### Restore to preview
```bash
docker run --rm -i postgres:17 psql "$HOMEGAME_OFFICIALS_PREVIEW_DB" \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker run --rm -i postgres:17 psql "$HOMEGAME_OFFICIALS_PREVIEW_DB" < prod-backup.sql
```

#### Restore to local
```
docker exec -i homegame-postgres psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i homegame-postgres psql -U postgres < prod-backup.sql
```

Or Neon → `preview` → Reset from parent. Run `pnpm db:push` after restore if your branch has newer schema.

To clear local database:

```bash
docker exec -i homegame-postgres psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Deployment

Github Actions and Vercel CI does all magic.

* Git push and create PR -> preview deployment (preview database).
* Merge to main -> production deployment
    * Create tag after deploy

## Credits

Created by [Timo Kirkkala](https://github.com/kirkkala) to help basketball team managers organize game officials for home games.
