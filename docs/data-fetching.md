# Data Fetching Standards

This document defines the **mandatory** data fetching patterns for this application.

## ⚠️ CRITICAL RULES

### 1. Server Components ONLY

**ALL data fetching MUST be done via Server Components.**

- ✅ **ALLOWED**: Fetching data in Server Components (app/ directory components without 'use client')
- ❌ **FORBIDDEN**: Route handlers (app/api/ routes) for data fetching
- ❌ **FORBIDDEN**: Client Components ('use client') for data fetching
- ❌ **FORBIDDEN**: Any other data fetching method

**Example:**

```typescript
// ✅ CORRECT: Server Component
// app/workouts/page.tsx
import { getWorkouts } from '@/data/workouts';

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();
  return <div>{/* render workouts */}</div>;
}

// ❌ WRONG: Route handler
// app/api/workouts/route.ts - DO NOT DO THIS
export async function GET() {
  const workouts = await getWorkouts();
  return Response.json(workouts);
}

// ❌ WRONG: Client Component with useEffect
'use client';
export default function WorkoutsPage() {
  useEffect(() => {
    fetch('/api/workouts'); // DO NOT DO THIS
  }, []);
}
```

### 2. Database Queries via /data Directory

**ALL database queries MUST be done through helper functions in the `/data` directory.**

- ✅ **ALLOWED**: Helper functions in `/data` directory using Drizzle ORM
- ❌ **FORBIDDEN**: Raw SQL queries
- ❌ **FORBIDDEN**: Direct database queries outside `/data` directory

**Pattern:**

```typescript
// ✅ CORRECT: /data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getWorkouts(userId: string) {
  return await db.select().from(workouts).where(eq(workouts.userId, userId));
}

// ❌ WRONG: Raw SQL
import { db } from '@/db';
export async function getWorkouts(userId: string) {
  return await db.execute(`SELECT * FROM workouts WHERE user_id = ${userId}`); // DO NOT DO THIS
}

// ❌ WRONG: Direct query in component
// app/workouts/page.tsx
import { db } from '@/db';
export default async function WorkoutsPage() {
  const workouts = await db.select().from(workouts); // DO NOT DO THIS
  // ...
}
```

### 3. User Data Isolation

**Logged-in users can ONLY access their own data.**

- ✅ **REQUIRED**: Always filter queries by authenticated user ID
- ❌ **FORBIDDEN**: Accessing any other user's data
- ❌ **FORBIDDEN**: Queries without user ID filtering

**Pattern:**

```typescript
// ✅ CORRECT: User-scoped query
// /data/workouts.ts
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// app/workouts/page.tsx
import { getWorkouts } from '@/data/workouts';

export default async function WorkoutsPage() {
  const workouts = await getWorkouts(); // Automatically scoped to current user
  return <div>{/* render workouts */}</div>;
}

// ❌ WRONG: No user filtering
export async function getWorkouts() {
  return await db.select().from(workouts); // Exposes ALL users' data - DO NOT DO THIS
}

// ❌ WRONG: User ID passed as parameter (security risk)
export async function getWorkouts(userId: string) {
  return await db.select().from(workouts).where(eq(workouts.userId, userId));
  // Caller could pass any userId - DO NOT DO THIS
}
```

## Summary

1. **Server Components ONLY** - Never use route handlers or client components for data fetching
2. **Drizzle ORM via /data helpers** - Never use raw SQL or direct queries
3. **Auto-scoped to current user** - Always get userId from `auth()` inside the helper function

These rules are **non-negotiable** and must be followed in all cases.
