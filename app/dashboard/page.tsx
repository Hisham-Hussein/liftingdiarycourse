import { getWorkoutsForDate } from '@/data/workouts'
import { DashboardClient } from '@/components/dashboard-client'

type SearchParams = Promise<{ date?: string }>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  // Parse the date from search params or use today
  const dateStr = params.date
  const date = dateStr ? new Date(dateStr) : new Date()

  // Fetch workouts for the selected date
  const workouts = await getWorkoutsForDate(date)

  return <DashboardClient initialDate={date} workouts={workouts} />
}
