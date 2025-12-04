'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRouter } from 'next/navigation'

type WorkoutData = {
  id: string
  name: string | null
  notes: string | null
  date: Date
  workoutExercises: {
    id: string
    orderIndex: number
    exercise: {
      id: string
      name: string
      description: string | null
    }
    sets: {
      id: string
      setNumber: number
      reps: number
      weight: string
    }[]
  }[]
}

type DashboardClientProps = {
  initialDate: Date
  workouts: WorkoutData[]
}

export function DashboardClient({ initialDate, workouts }: DashboardClientProps) {
  const [date, setDate] = useState<Date>(initialDate)
  const router = useRouter()

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      // Update URL with new date
      const dateStr = format(newDate, 'yyyy-MM-dd')
      router.push(`/dashboard?date=${dateStr}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header with Datepicker */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workout Diary</h1>
            <p className="text-muted-foreground">
              Track your lifting progress
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'do MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workouts for Selected Date */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Workouts for {format(date, 'do MMM yyyy')}
          </h2>

          {workouts.length > 0 ? (
            <div className="grid gap-4">
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{workout.name || 'Unnamed Workout'}</CardTitle>
                        <CardDescription>
                          {workout.workoutExercises.length} exercise{workout.workoutExercises.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Exercise List */}
                    <div className="space-y-3">
                      {workout.workoutExercises.map((workoutExercise) => {
                        const totalSets = workoutExercise.sets.length
                        const avgReps = totalSets > 0
                          ? Math.round(
                              workoutExercise.sets.reduce((sum, set) => sum + set.reps, 0) / totalSets
                            )
                          : 0
                        const avgWeight = totalSets > 0
                          ? workoutExercise.sets.reduce(
                              (sum, set) => sum + parseFloat(set.weight),
                              0
                            ) / totalSets
                          : 0

                        return (
                          <div
                            key={workoutExercise.id}
                            className="flex justify-between items-center p-3 rounded-lg border bg-card"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{workoutExercise.exercise.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {totalSets} set{totalSets !== 1 ? 's' : ''} × {avgReps} reps
                                {avgWeight > 0 && ` @ ${avgWeight.toFixed(1)} lbs`}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Notes */}
                    {workout.notes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-1">Notes:</p>
                        <p className="text-sm text-muted-foreground">
                          {workout.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>No workouts logged for this date.</p>
                  <Button className="mt-4" variant="default">
                    Log Workout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
