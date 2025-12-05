# Data Mutations Standards

This document defines the coding standards for all data mutations (INSERT, UPDATE, DELETE operations) in this application.

## Overview

All data mutations follow a **three-layer architecture**:

1. **Server Actions** (in `actions.ts` files) - Handle client requests, validation, and authorization
2. **Data Helper Functions** (in `/data` directory) - Encapsulate database operations
3. **Drizzle ORM** - Execute SQL queries against the database

## Architecture Layers

### Layer 1: Server Actions

Server actions are defined in co-located `actions.ts` files within the app directory structure.

#### Naming Convention
- Place server actions in files named `actions.ts` co-located with the components that use them
- Example: `app/workouts/actions.ts` for workout-related mutations

#### Required Patterns

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createWorkout, updateWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

// 1. Define Zod schema for validation
const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

// 2. Define TypeScript type from schema
type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

// 3. Server action function
export async function createWorkoutAction(input: CreateWorkoutInput) {
  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Validation
  const validatedData = createWorkoutSchema.parse(input);

  // Call data helper function
  const workout = await createWorkout({
    ...validatedData,
    userId,
  });

  // Revalidate relevant paths
  revalidatePath('/workouts');

  return workout;
}
```

#### Critical Rules for Server Actions

✅ **DO:**
- Always start file with `'use server'` directive
- Use typed parameters (NOT FormData)
- Validate ALL inputs with Zod schemas
- Check authentication using `await auth()` from Clerk
- Call data helper functions from `/data` directory
- Use `revalidatePath()` or `revalidateTag()` after mutations
- Return meaningful data or errors
- Use descriptive action names ending in "Action" (e.g., `createWorkoutAction`)

❌ **DO NOT:**
- Use `FormData` as parameter type
- Skip validation
- Write direct database queries in actions
- Forget authentication checks
- Mutate data without revalidation
- Use `redirect()` from `next/navigation` within server actions (redirects should be handled client-side after the action resolves)

#### Example: Complete Server Action File

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  createExercise,
  updateExercise,
  deleteExercise
} from '@/data/exercises';

// Schemas
const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.enum(['chest', 'back', 'legs', 'shoulders', 'arms']),
  equipment: z.string().max(50).optional(),
});

const updateExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  muscleGroup: z.enum(['chest', 'back', 'legs', 'shoulders', 'arms']).optional(),
  equipment: z.string().max(50).optional(),
});

const deleteExerciseSchema = z.object({
  id: z.string().uuid(),
});

// Types
type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;

// Actions
export async function createExerciseAction(input: CreateExerciseInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const validatedData = createExerciseSchema.parse(input);

  const exercise = await createExercise({
    ...validatedData,
    userId,
  });

  revalidatePath('/exercises');
  return exercise;
}

export async function updateExerciseAction(input: UpdateExerciseInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const validatedData = updateExerciseSchema.parse(input);

  const exercise = await updateExercise(validatedData, userId);

  revalidatePath('/exercises');
  revalidatePath(`/exercises/${validatedData.id}`);
  return exercise;
}

export async function deleteExerciseAction(input: DeleteExerciseInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const validatedData = deleteExerciseSchema.parse(input);

  await deleteExercise(validatedData.id, userId);

  revalidatePath('/exercises');
}
```

### Layer 2: Data Helper Functions

Data helper functions live in the `/data` directory and encapsulate all Drizzle ORM database operations.

#### File Organization

```
data/
  workouts.ts      # Workout-related data operations
  exercises.ts     # Exercise-related data operations
  users.ts         # User-related data operations
```

#### Required Patterns

```typescript
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// CREATE operation
export async function createWorkout(data: {
  name: string;
  date: string;
  userId: string;
  notes?: string;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}

// UPDATE operation
export async function updateWorkout(
  data: { id: string; name?: string; notes?: string },
  userId: string
) {
  // User isolation: ensure user can only update their own data
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(
      eq(workouts.id, data.id),
      eq(workouts.userId, userId)
    ))
    .returning();

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  return workout;
}

// DELETE operation
export async function deleteWorkout(id: string, userId: string) {
  // User isolation: ensure user can only delete their own data
  const [deleted] = await db
    .delete(workouts)
    .where(and(
      eq(workouts.id, id),
      eq(workouts.userId, userId)
    ))
    .returning();

  if (!deleted) {
    throw new Error('Workout not found or unauthorized');
  }

  return deleted;
}
```

#### Critical Rules for Data Helpers

✅ **DO:**
- Export pure functions that wrap Drizzle ORM operations
- Always enforce user data isolation (check `userId` in WHERE clauses)
- Use `.returning()` to get created/updated/deleted records
- Use Drizzle's query builder (`.insert()`, `.update()`, `.delete()`)
- Handle cases where no records are affected (throw errors)
- Use TypeScript for type safety
- Import `db` instance from `@/db`

❌ **DO NOT:**
- Write raw SQL queries (use Drizzle's query builder)
- Skip user isolation checks
- Perform authorization logic (that belongs in server actions)
- Call other data helper functions that cause circular dependencies
- Expose these functions to client components

### Layer 3: Drizzle ORM

Drizzle ORM handles the actual database operations. Configuration and schema are defined separately.

#### Database Instance

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client);
```

#### Schema Definition

```typescript
// db/schema.ts
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  userId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Complete Flow Example

### 1. Client Component Calls Server Action

```typescript
'use client';

import { createWorkoutAction } from './actions';
import { useState } from 'react';

export function CreateWorkoutForm() {
  const [name, setName] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createWorkoutAction({
        name,
        date: new Date().toISOString(),
      });

      // Handle success
      setName('');
    } catch (error) {
      // Handle error
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Create Workout</button>
    </form>
  );
}
```

### 2. Server Action (`actions.ts`)

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().datetime(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const validatedData = createWorkoutSchema.parse(input);

  const workout = await createWorkout({
    ...validatedData,
    userId,
  });

  revalidatePath('/workouts');
  return workout;
}
```

### 3. Data Helper (`data/workouts.ts`)

```typescript
import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkout(data: {
  name: string;
  date: string;
  userId: string;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}
```

## Error Handling

### In Server Actions

```typescript
export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = createWorkoutSchema.parse(input);
    const workout = await createWorkout({ ...validatedData, userId });

    revalidatePath('/workouts');
    return { success: true, data: workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    return { error: 'Failed to create workout' };
  }
}
```

### In Data Helpers

```typescript
export async function updateWorkout(
  data: { id: string; name?: string },
  userId: string
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(
      eq(workouts.id, data.id),
      eq(workouts.userId, userId)
    ))
    .returning();

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  return workout;
}
```

## Cache Revalidation

After mutations, always revalidate affected paths:

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
revalidatePath('/workouts');

// Revalidate dynamic route
revalidatePath(`/workouts/${workoutId}`);

// Revalidate all workouts pages
revalidatePath('/workouts', 'layout');

// Revalidate by cache tag (if using fetch with tags)
revalidateTag('workouts');
```

## Navigation and Redirects

**CRITICAL:** Server actions should NOT handle navigation. Redirects must be performed client-side after the server action resolves.

### ❌ WRONG: Using redirect() in Server Action

```typescript
'use server';

import { redirect } from 'next/navigation'; // DO NOT DO THIS

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const validatedData = createWorkoutSchema.parse(input);
  const workout = await createWorkout({ ...validatedData, userId });

  revalidatePath('/workouts');
  redirect('/dashboard'); // ❌ DO NOT REDIRECT HERE
}
```

### ✅ CORRECT: Client-Side Redirect After Action

**Server Action:**
```typescript
'use server';

export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = createWorkoutSchema.parse(input);
    const workout = await createWorkout({ ...validatedData, userId });

    revalidatePath('/workouts');
    return { success: true, data: workout }; // ✅ Return success indicator
  } catch (error) {
    return { error: 'Failed to create workout' };
  }
}
```

**Client Component:**
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { createWorkoutAction } from './actions';

export function CreateWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await createWorkoutAction({ name, date });

    if (result.success) {
      router.push('/dashboard'); // ✅ Redirect client-side
    } else {
      // Handle error
      setError(result.error);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Why This Pattern?

1. **Separation of Concerns**: Server actions handle data mutations, client components handle navigation
2. **Better Error Handling**: Allows the client to decide what to do based on the result
3. **Flexibility**: Client can perform additional logic before/after navigation
4. **User Experience**: Client-side routing provides better UX with Next.js transitions

## Summary Checklist

Before writing any data mutation code:

- [ ] Server action in co-located `actions.ts` file with `'use server'` directive
- [ ] Typed parameters (NO FormData)
- [ ] Zod schema for validation
- [ ] Authentication check via `await auth()`
- [ ] Data helper function in `/data` directory
- [ ] User data isolation in data helper WHERE clauses
- [ ] Drizzle ORM query builder (no raw SQL)
- [ ] Cache revalidation after mutation
- [ ] Error handling with meaningful messages
- [ ] TypeScript types derived from Zod schemas
- [ ] NO `redirect()` calls in server actions (handle navigation client-side)

---

**Remember:** This architecture ensures type safety, user data isolation, proper validation, and maintainable code. Never skip any layer or bypass these patterns.
