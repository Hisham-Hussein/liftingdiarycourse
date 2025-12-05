'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { updateWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

const updateWorkoutSchema = z.object({
  id: z.string().uuid('Invalid workout ID'),
  name: z.string().min(1, 'Workout name is required').max(100, 'Name must be less than 100 characters').optional(),
  date: z.date().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = updateWorkoutSchema.parse(input);

    const workout = await updateWorkout(validatedData, userId);

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/workout/${validatedData.id}`);

    return { success: true, data: workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input' };
    }
    return { error: 'Failed to update workout' };
  }
}
