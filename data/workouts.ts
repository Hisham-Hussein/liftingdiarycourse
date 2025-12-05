import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

/**
 * Get all workouts for the currently authenticated user on a specific date
 */
export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Get start and end of the selected date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Query workouts with their exercises, sets, and exercise details
  const userWorkouts = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.date, startOfDay),
      lt(workouts.date, endOfDay)
    ),
    orderBy: (workouts, { desc }) => [desc(workouts.createdAt)],
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  return userWorkouts;
}

/**
 * Get all workouts for the currently authenticated user
 */
export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    orderBy: (workouts, { desc }) => [desc(workouts.date)],
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });
}

/**
 * Get a single workout by ID for the currently authenticated user
 */
export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)
    ),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  return workout;
}

/**
 * Create a new workout for the currently authenticated user
 */
export async function createWorkout(data: {
  name: string;
  date: Date;
  notes?: string;
  userId: string;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}

/**
 * Update a workout for the currently authenticated user
 */
export async function updateWorkout(data: {
  id: string;
  name?: string;
  date?: Date;
  notes?: string;
}, userId: string) {
  const [workout] = await db
    .update(workouts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
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
