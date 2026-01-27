# CalcEdu - Educational Calculator

## Overview

CalcEdu is an educational web calculator designed for Brazilian high school students (Ensino Médio). It provides a mobile-native calculator experience with step-by-step explanations for mathematical operations, a comprehensive formula guide covering Math, Physics, and Chemistry topics, and an interactive formula calculator. The application features a dark theme inspired by iOS/Material You calculator designs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Calculator, Landing, Plans, NotFound)
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/`
- Utility functions and custom calculator engine in `client/src/lib/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`
- **Authentication**: Replit Auth (OpenID Connect) with session management
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

The server structure:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route registration
- `server/storage.ts` - Database abstraction layer
- `server/replit_integrations/auth/` - Authentication module

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**:
  - `history` - Calculation history with expressions, results, and explanation steps
  - `sessions` - User sessions for authentication
  - `users` - User profiles with plan information (free/premium)
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication Flow
1. Replit Auth handles OAuth/OIDC login
2. Sessions stored in PostgreSQL
3. User data upserted on login
4. Plan selection required before accessing calculator

### Key Design Decisions

**Custom Calculator Engine**: Rather than using a library like mathjs, the app implements a custom expression evaluator (`client/src/lib/calculator-engine.ts`) that generates step-by-step explanations in Portuguese. This enables the educational feature of showing how calculations are solved.

**Mobile-First Dark Theme**: The UI uses pure black (#000000) backgrounds with high-contrast orange accents, designed to feel native on mobile devices. The layout uses 100vw/100vh to fill the screen.

**Monorepo Structure**: Frontend and backend share types via the `shared/` directory, ensuring type safety across the stack. Path aliases (`@/`, `@shared/`) simplify imports.

**Freemium Model**: Users select between free and premium plans. The plan selection is stored in the database and gates access to premium features like advanced formulas and unlimited explanations.

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### Authentication
- Replit Auth (OpenID Connect provider at `https://replit.com/oidc`)
- Requires `REPL_ID`, `SESSION_SECRET`, and `ISSUER_URL` environment variables

### Frontend Libraries
- Radix UI primitives for accessible components
- Framer Motion for animations
- TanStack Query for data fetching and caching
- Lucide React for icons

### Development Tools
- Vite for frontend bundling and HMR
- esbuild for server bundling
- TypeScript for type checking
- Tailwind CSS for styling