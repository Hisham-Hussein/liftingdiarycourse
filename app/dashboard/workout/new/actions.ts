'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100, 'Name must be less than 100 characters'),
  date: z.date(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = createWorkoutSchema.parse(input);

    const workout = await createWorkout({
      ...validatedData,
      userId,
    });

    revalidatePath('/dashboard');

    return { success: true, data: workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input' };
    }
    return { error: 'Failed to create workout' };
  }
}
