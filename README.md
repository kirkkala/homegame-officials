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
├── data/                   # Local JSON storage (dev)
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
