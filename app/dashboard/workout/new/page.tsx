import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateWorkoutForm } from './create-workout-form';

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateWorkoutForm />
        </CardContent>
      </Card>
    </div>
  );
}
