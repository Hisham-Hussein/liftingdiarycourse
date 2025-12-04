'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Fake workout data
const fakeWorkouts = [
  {
    id: 1,
    name: 'Upper Body Strength',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight: 185 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 95 },
      { name: 'Pull-ups', sets: 3, reps: 12, weight: 0 },
      { name: 'Dumbbell Rows', sets: 3, reps: 10, weight: 70 },
    ],
    duration: 65,
    notes: 'Felt strong today, increased bench press weight by 5lbs',
  },
  {
    id: 2,
    name: 'Core & Accessories',
    exercises: [
      { name: 'Planks', sets: 3, reps: 60, weight: 0 },
      { name: 'Russian Twists', sets: 3, reps: 20, weight: 25 },
      { name: 'Cable Crunches', sets: 3, reps: 15, weight: 60 },
    ],
    duration: 30,
    notes: 'Quick core session after main workout',
  },
]

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date())

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
                onSelect={(newDate) => newDate && setDate(newDate)}
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

          {fakeWorkouts.length > 0 ? (
            <div className="grid gap-4">
              {fakeWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{workout.name}</CardTitle>
                        <CardDescription>
                          {workout.duration} minutes • {workout.exercises.length} exercises
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
                      {workout.exercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight > 0 && ` @ ${exercise.weight} lbs`}
                            </p>
                          </div>
                        </div>
                      ))}
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
