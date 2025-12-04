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
