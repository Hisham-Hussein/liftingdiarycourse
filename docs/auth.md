# Authentication Standards

## Overview

This application uses **Clerk** for authentication and user management. All authentication-related code must follow the patterns and standards defined in this document.

## Core Principles

1. **Server-First**: Prioritize server-side authentication checks using Server Components
2. **Type Safety**: Always use TypeScript types from Clerk packages
3. **User Isolation**: All data queries must be scoped to the authenticated user
4. **Modern Patterns Only**: Use App Router patterns exclusively (no Pages Router patterns)

## Setup

### Package
```bash
npm install @clerk/nextjs
```

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Get keys from: https://dashboard.clerk.com/last-active?path=api-keys

## Middleware Configuration

**Location**: `/proxy.ts` (root level)

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Critical: Never Use Deprecated Patterns
- ❌ DO NOT use `authMiddleware()` (deprecated)
- ❌ DO NOT use `createRouteMatcher()` with complex auth logic
- ✅ ALWAYS use `clerkMiddleware()` from `@clerk/nextjs/server`

## Root Layout Configuration

**Location**: `/app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Server-Side Authentication

### Accessing User ID in Server Components

**Always use async/await pattern:**

```typescript
import { auth } from '@clerk/nextjs/server';

export default async function MyServerComponent() {
  const { userId } = await auth();

  if (!userId) {
    // Handle unauthenticated state
    return <div>Please sign in</div>;
  }

  // userId is guaranteed to be a string here
  const userData = await fetchUserData(userId);

  return <div>Welcome, {userData.name}</div>;
}
```

### Accessing Full User Object

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function MyServerComponent() {
  const user = await currentUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  // Access user properties
  const email = user.emailAddresses[0]?.emailAddress;
  const firstName = user.firstName;

  return <div>Welcome, {firstName}</div>;
}
```

### API Routes

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user-specific data
  const data = await fetchData(userId);

  return NextResponse.json({ data });
}
```

## Client-Side Authentication

### Using Clerk Components

Import from `@clerk/nextjs`:

```typescript
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
  );
}
```

### Component Reference

- **`<SignedIn>`** - Renders children only when user is authenticated
- **`<SignedOut>`** - Renders children only when user is not authenticated
- **`<SignInButton>`** - Triggers Clerk's sign-in flow
  - Use `mode="modal"` for modal experience
  - Use `mode="redirect"` to redirect to sign-in page
- **`<SignUpButton>`** - Triggers Clerk's sign-up flow
- **`<UserButton>`** - Pre-built user menu with profile and sign-out
  - Use `afterSignOutUrl` prop to specify redirect after sign-out

### Using Clerk Hooks (Client Components Only)

```typescript
'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export default function ClientComponent() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { userId } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user.firstName}</div>;
}
```

## Protected Routes

### Server Component Protection

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return <div>Protected content</div>;
}
```

### Layout-Level Protection

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return <div>{children}</div>;
}
```

## Data Fetching with Authentication

**Always scope database queries to the authenticated user.**

See `/docs/data-fetching.md` for database integration patterns.

Example:
```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

## Common Patterns

### Conditional Rendering Based on Auth

```typescript
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}
```

### Getting User ID for Database Operations

```typescript
import { auth } from '@clerk/nextjs/server';

async function createWorkout(data: WorkoutData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await db.insert(workouts).values({
    ...data,
    userId,
  });
}
```

## Error Handling

### Server Components

```typescript
const { userId } = await auth();

if (!userId) {
  // Option 1: Redirect
  redirect('/sign-in');

  // Option 2: Show sign-in prompt
  return (
    <div>
      <p>Please sign in to continue</p>
      <SignInButton />
    </div>
  );

  // Option 3: Throw error (use sparingly)
  throw new Error('Unauthorized');
}
```

### API Routes

```typescript
const { userId } = await auth();

if (!userId) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

## Security Best Practices

1. **Never trust client-side auth state for authorization** - Always verify on the server
2. **Always check `userId` before database operations** - Prevent unauthorized access
3. **Use Server Components by default** - Client components should only be used when necessary
4. **Scope all queries to the authenticated user** - Add `where` clauses filtering by `userId`
5. **Handle unauthenticated states explicitly** - Don't assume users are always signed in
6. **Use type guards after auth checks** - TypeScript will understand `userId` is non-null after if check

## Anti-Patterns (DO NOT USE)

❌ Using deprecated `authMiddleware()`:
```typescript
// WRONG - deprecated
import { authMiddleware } from '@clerk/nextjs';
export default authMiddleware();
```

❌ Using Pages Router patterns:
```typescript
// WRONG - this is Pages Router approach
import { getAuth } from '@clerk/nextjs/server';

export async function getServerSideProps(context) {
  const { userId } = getAuth(context.req);
}
```

❌ Client-side only auth checks for protected data:
```typescript
// WRONG - can be bypassed
'use client';
function ProtectedData() {
  const { userId } = useAuth();
  if (!userId) return null;
  // Fetching data client-side without server verification
}
```

❌ Forgetting to await `auth()`:
```typescript
// WRONG - auth() returns a Promise
const { userId } = auth(); // Missing await
```

## Testing Considerations

When testing authenticated flows:

1. Use Clerk's test mode in development
2. Create test users via Clerk Dashboard
3. Test both authenticated and unauthenticated states
4. Verify redirect behavior for protected routes
5. Check that user data is properly isolated

## Additional Resources

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk App Router Guide](https://clerk.com/docs/references/nextjs/overview)
- [Clerk Components Reference](https://clerk.com/docs/components/overview)
