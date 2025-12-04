import 'dotenv/config';
import { db } from './index';
import { exercises } from './schema';

const exerciseData = [
  // Chest
  { name: 'Barbell Bench Press', description: 'Compound chest exercise using a barbell', muscleGroup: 'Chest' },
  { name: 'Dumbbell Bench Press', description: 'Chest press using dumbbells for greater range of motion', muscleGroup: 'Chest' },
  { name: 'Incline Barbell Bench Press', description: 'Bench press at an incline to target upper chest', muscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', description: 'Incline press using dumbbells', muscleGroup: 'Chest' },
  { name: 'Chest Dips', description: 'Bodyweight exercise targeting chest and triceps', muscleGroup: 'Chest' },
  { name: 'Cable Flyes', description: 'Isolation exercise for chest using cables', muscleGroup: 'Chest' },
  { name: 'Push-ups', description: 'Bodyweight chest exercise', muscleGroup: 'Chest' },

  // Back
  { name: 'Conventional Deadlift', description: 'Compound exercise targeting back, glutes, and hamstrings', muscleGroup: 'Back' },
  { name: 'Barbell Row', description: 'Bent-over row for back thickness', muscleGroup: 'Back' },
  { name: 'Pull-ups', description: 'Bodyweight exercise for back width', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', description: 'Cable exercise targeting lats', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', description: 'Cable row for mid-back', muscleGroup: 'Back' },
  { name: 'T-Bar Row', description: 'Row variation using T-bar apparatus', muscleGroup: 'Back' },
  { name: 'Face Pulls', description: 'Cable exercise for rear delts and upper back', muscleGroup: 'Back' },

  // Legs
  { name: 'Barbell Back Squat', description: 'Compound leg exercise with bar on upper back', muscleGroup: 'Legs' },
  { name: 'Front Squat', description: 'Squat variation with bar on front shoulders', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', description: 'Hip hinge movement targeting hamstrings and glutes', muscleGroup: 'Legs' },
  { name: 'Leg Press', description: 'Machine exercise for overall leg development', muscleGroup: 'Legs' },
  { name: 'Bulgarian Split Squat', description: 'Single-leg squat variation', muscleGroup: 'Legs' },
  { name: 'Leg Curl', description: 'Isolation exercise for hamstrings', muscleGroup: 'Legs' },
  { name: 'Leg Extension', description: 'Isolation exercise for quadriceps', muscleGroup: 'Legs' },
  { name: 'Walking Lunges', description: 'Dynamic leg exercise', muscleGroup: 'Legs' },
  { name: 'Calf Raises', description: 'Isolation exercise for calves', muscleGroup: 'Legs' },

  // Shoulders
  { name: 'Overhead Press', description: 'Compound shoulder exercise pressing overhead', muscleGroup: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', description: 'Shoulder press using dumbbells', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raises', description: 'Isolation for side delts', muscleGroup: 'Shoulders' },
  { name: 'Front Raises', description: 'Isolation for front delts', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Flyes', description: 'Isolation for rear delts', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', description: 'Dumbbell press with rotation', muscleGroup: 'Shoulders' },
  { name: 'Upright Row', description: 'Pull exercise for shoulders and traps', muscleGroup: 'Shoulders' },

  // Arms
  { name: 'Barbell Curl', description: 'Classic bicep exercise with barbell', muscleGroup: 'Arms' },
  { name: 'Dumbbell Curl', description: 'Bicep curl using dumbbells', muscleGroup: 'Arms' },
  { name: 'Hammer Curl', description: 'Neutral grip curl for biceps and brachialis', muscleGroup: 'Arms' },
  { name: 'Preacher Curl', description: 'Isolated bicep curl on preacher bench', muscleGroup: 'Arms' },
  { name: 'Close-Grip Bench Press', description: 'Bench press variation for triceps', muscleGroup: 'Arms' },
  { name: 'Tricep Dips', description: 'Bodyweight exercise for triceps', muscleGroup: 'Arms' },
  { name: 'Overhead Tricep Extension', description: 'Isolation exercise for triceps', muscleGroup: 'Arms' },
  { name: 'Tricep Pushdown', description: 'Cable exercise for triceps', muscleGroup: 'Arms' },
  { name: 'Skull Crushers', description: 'Lying tricep extension', muscleGroup: 'Arms' },

  // Core
  { name: 'Plank', description: 'Isometric core exercise', muscleGroup: 'Core' },
  { name: 'Hanging Leg Raises', description: 'Advanced ab exercise', muscleGroup: 'Core' },
  { name: 'Cable Crunches', description: 'Weighted ab exercise using cable', muscleGroup: 'Core' },
  { name: 'Russian Twists', description: 'Rotational core exercise', muscleGroup: 'Core' },
  { name: 'Ab Wheel Rollout', description: 'Advanced core stability exercise', muscleGroup: 'Core' },
];

async function seed() {
  console.log('Seeding database...');

  try {
    // Insert all exercises
    await db.insert(exercises).values(exerciseData);

    console.log(`Successfully seeded ${exerciseData.length} exercises!`);
    console.log('Exercises by muscle group:');

    const groups = exerciseData.reduce((acc, exercise) => {
      acc[exercise.muscleGroup] = (acc[exercise.muscleGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(groups).forEach(([group, count]) => {
      console.log(`  - ${group}: ${count} exercises`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }

  process.exit(0);
}

seed();
