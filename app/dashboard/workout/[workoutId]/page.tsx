import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorkoutById } from '@/data/workouts';
import { EditWorkoutForm } from './edit-workout-form';

interface EditWorkoutPageProps {
  params: Promise<{
    workoutId: string;
  }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const { workoutId } = await params;

  let workout;
  try {
    workout = await getWorkoutById(workoutId);
  } catch (error) {
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm workout={workout} />
        </CardContent>
      </Card>
    </div>
  );
}
