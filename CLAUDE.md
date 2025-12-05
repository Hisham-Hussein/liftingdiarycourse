# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application built with TypeScript, React 19, and Tailwind CSS v4 (using the new @tailwindcss/postcss plugin). The project appears to be for a "Lifting Diary Course" application, currently in its initial setup phase.

## ⚠️ CRITICAL: Documentation-First Approach

**BEFORE generating ANY code, you MUST:**

1. **Check the `/docs` directory** for relevant documentation
2. **Read and follow ALL guidelines** in the applicable documentation files
3. **Strictly adhere** to the standards defined in those documents

### Current Documentation Files

- **`/docs/ui.md`** - UI coding standards (shadcn/ui components, date formatting)

- **`/docs/data-fetching.md`** - Data fetching standards (Server Components, Drizzle ORM, user data isolation)

- **`/docs/data-mutations.md`** - Data mutation standards (Server Actions, Zod validation, data helpers)

- **`/docs/auth.md`** - Authentication standards (Clerk integration, server/client patterns, protected routes)

- **`/docs/routing.md`** - Routing standards (dashboard-based routes, middleware protection)

**Failure to consult and follow the documentation in `/docs` before writing code is unacceptable.**

All code must comply with the standards defined in the documentation files. If documentation exists for the area you're working in, it takes precedence over general best practices.

## Development Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

### Framework: Next.js 16 (App Router)
- Uses the App Router paradigm (app/ directory)
- File-based routing with React Server Components by default
- All components in app/ are Server Components unless marked with 'use client'

### Styling: Tailwind CSS v4
- Uses the new Tailwind CSS v4 with @tailwindcss/postcss plugin (not the traditional tailwind.config.js approach)
- Configuration is in postcss.config.mjs
- Global styles and theme variables defined in app/globals.css using @theme inline
- CSS variables in :root define --background and --foreground with dark mode support
- Custom theme tokens accessible via Tailwind classes (background, foreground, font-sans, font-mono)

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path alias: @/* maps to project root
- JSX mode: react-jsx (new JSX transform)

### Fonts
- Uses Next.js font optimization with Geist and Geist Mono from next/font/google
- Font variables (--font-geist-sans, --font-geist-mono) defined in root layout

### Linting
- ESLint configured with Next.js recommended rules
- Uses new flat config format (eslint.config.mjs)
- Includes both core-web-vitals and TypeScript rules from eslint-config-next

### Authentication: Clerk
**⚠️ See `/docs/auth.md` for complete authentication standards and patterns.**

Quick reference:
- Uses @clerk/nextjs for authentication (App Router approach)
- Middleware: proxy.ts with `clerkMiddleware()` from @clerk/nextjs/server
- Layout: app/layout.tsx wrapped with `<ClerkProvider>`
- Server-side: `const { userId } = await auth();`
- Client components: `<SignedIn>`, `<SignedOut>`, `<UserButton>`
- **Always verify auth server-side for protected data**
- **Always scope database queries to userId**

## Project Structure

```
app/
  layout.tsx       # Root layout with ClerkProvider, fonts, and auth UI
  page.tsx         # Home page
  globals.css      # Tailwind imports and theme configuration
proxy.ts           # Clerk middleware with clerkMiddleware()
.env.local         # Environment variables (not tracked in git)
public/            # Static assets
```

## Key Patterns

### Server vs Client Components
- Default to Server Components (no 'use client' directive)
- Only add 'use client' when you need:
  - React hooks (useState, useEffect, etc.)
  - Browser APIs
  - Event handlers
  - Third-party libraries that require client-side rendering

### Styling Approach
- Use Tailwind utility classes directly in JSX
- Theme tokens (background, foreground) defined in globals.css
- Dark mode handled via prefers-color-scheme media query
- No separate tailwind.config.ts/js file (Tailwind v4 uses PostCSS plugin)

### Metadata
- Define metadata in layout.tsx or page.tsx using the Metadata type from next
- App currently titled "Create Next App" - should be updated for the lifting diary course

### Image Optimization
- Use next/image for all images
- Specify width, height, and alt text
- Use priority prop for above-the-fold images
