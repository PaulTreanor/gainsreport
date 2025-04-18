import { Exercise, Goal, Set, Workout, WorkoutLog } from "./types";

export function parseWorkoutLog(markdown: string): WorkoutLog {
  const lines = markdown.split('\n');
  const goals: Goal[] = [];
  const workouts: Workout[] = [];
  
  let currentSection: 'goals' | 'workout' | null = null;
  let currentWorkout: Workout | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') continue;
    
    // Parse goals section
    if (line === '# Goals') {
      currentSection = 'goals';
      continue;
    }
    
    // Parse workout section
    if (line.startsWith('## ')) {
      currentSection = 'workout';
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      
      const date = line.substring(3).trim();
      currentWorkout = {
        date,
        exercises: [],
      };
      continue;
    }
    
    // Parse goals
    if (currentSection === 'goals' && line.startsWith('- [')) {
      const completed = line.startsWith('- [x]');
      const parts = line.substring(completed ? 6 : 5).trim().split(': ');
      const date = parts[0];
      const description = parts.slice(1).join(': ');
      
      goals.push({
        description,
        completed,
        date,
      });
    }
    
    // Parse exercises
    if (currentSection === 'workout' && line.startsWith('- ') && currentWorkout) {
      const exerciseLine = line.substring(2);
      let note = '';
      
      // Check for note at the end of the line
      const noteMatch = exerciseLine.match(/ > (.+)$/);
      if (noteMatch) {
        note = noteMatch[1];
      }
      
      // Remove note from exercise line for further processing
      const exerciseLineWithoutNote = noteMatch ? exerciseLine.substring(0, exerciseLine.indexOf(' > ')) : exerciseLine;
      
      // Check for tags
      const tags: string[] = [];
      let exerciseLineWithoutTags = exerciseLineWithoutNote;
      
      const tagMatch = exerciseLineWithoutNote.match(/ #([\w,]+)/);
      if (tagMatch) {
        const tagStr = tagMatch[1];
        tags.push(...tagStr.split(',').map(tag => tag.trim()));
        exerciseLineWithoutTags = exerciseLineWithoutNote.substring(0, exerciseLineWithoutNote.indexOf(' #'));
      }
      
      // Parse exercise name and sets
      const [name, setsStr] = exerciseLineWithoutTags.split(':').map(part => part.trim());
      
      if (!setsStr) {
        // Handle empty exercise
        currentWorkout.exercises.push({
          name,
          sets: [],
          tags,
          note: note || undefined,
        });
        continue;
      }
      
      const setSpecs = setsStr.split(',').map(s => s.trim()).filter(Boolean);
      const sets: Set[] = [];
      
      for (const setSpec of setSpecs) {
        const setMatch = setSpec.match(/([\d]+)x([\d]+|Failure)(?:\s+@\s*([\d\.]+)([a-zA-Z]+|BW))?/);
        
        if (setMatch) {
          const [, setsStr, repsStr, weightValueStr, weightUnit] = setMatch;
          const setsValue = parseInt(setsStr, 10);
          const repsValue = repsStr === 'Failure' ? 'Failure' : parseInt(repsStr, 10);
          
          const set: Set = {
            sets: setsValue,
            reps: repsValue,
          };
          
          if (weightValueStr) {
            set.weight = {
              value: weightUnit === 'BW' ? 0 : parseFloat(weightValueStr),
              unit: weightUnit,
            };
          }
          
          sets.push(set);
        }
      }
      
      currentWorkout.exercises.push({
        name,
        sets,
        tags: tags.length > 0 ? tags : undefined,
        note: note || undefined,
      });
    }
  }
  
  // Add the last workout if it exists
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }
  
  // Sort workouts by date (oldest to newest)
  workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return { goals, workouts };
}

export function calculatePersonalRecords(workouts: Workout[]) {
  const prMap = new Map<string, Map<number, { weight: { value: number; unit: string }, date: string }>>();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        if (!set.weight || set.reps === 'Failure') continue;
        
        const exerciseName = exercise.name;
        const repMax = typeof set.reps === 'number' ? set.reps : 1;
        const weight = set.weight;
        
        if (!prMap.has(exerciseName)) {
          prMap.set(exerciseName, new Map());
        }
        
        const exercisePRs = prMap.get(exerciseName)!;
        
        // Check if this is a new PR for this rep range
        if (!exercisePRs.has(repMax) || exercisePRs.get(repMax)!.weight.value < weight.value) {
          exercisePRs.set(repMax, { weight, date: workout.date });
        }
      }
    }
  }
  
  // Convert map to array
  const personalRecords = [];
  
  for (const [exercise, repMaxMap] of prMap.entries()) {
    for (const [repMax, record] of repMaxMap.entries()) {
      personalRecords.push({
        exercise,
        repMax,
        weight: record.weight,
        date: record.date
      });
    }
  }
  
  return personalRecords;
}

export function calculateStreaks(workouts: Workout[]) {
  if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0 };
  
  // Convert dates to week numbers
  const workoutWeeks = workouts.map(workout => {
    const date = new Date(workout.date);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return { date: workout.date, week: `${date.getFullYear()}-${weekNumber}` };
  });
  
  // Group by week
  const weekMap = new Map<string, boolean>();
  for (const { week } of workoutWeeks) {
    weekMap.set(week, true);
  }
  
  // Sort weeks
  const weeks = Array.from(weekMap.keys()).sort();
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  
  for (let i = 0; i < weeks.length; i++) {
    const currentWeek = weeks[i];
    const [year, weekNum] = currentWeek.split('-').map(Number);
    
    if (i > 0) {
      const prevWeek = weeks[i - 1];
      const [prevYear, prevWeekNum] = prevWeek.split('-').map(Number);
      
      // Check if weeks are consecutive
      const isConsecutive = 
        (year === prevYear && weekNum === prevWeekNum + 1) || 
        (year === prevYear + 1 && weekNum === 1 && prevWeekNum >= 52);
      
      if (isConsecutive) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    
    longestStreak = Math.max(longestStreak, streak);
    
    // Check if this week includes the most recent workout
    const mostRecentWorkoutWeek = workoutWeeks[workoutWeeks.length - 1].week;
    if (currentWeek === mostRecentWorkoutWeek) {
      currentStreak = streak;
    }
  }
  
  return { currentStreak, longestStreak };
}

export function calculateDaysSinceLastWorkout(workouts: Workout[]) {
  if (workouts.length === 0) return 0;
  
  const lastWorkoutDate = new Date(workouts[workouts.length - 1].date);
  const today = new Date();
  
  // Reset time to avoid partial day calculations
  lastWorkoutDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastWorkoutDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getNonImprovingExercises(workouts: Workout[], count = 5) {
  if (workouts.length < 2) return [];
  
  // Track last improvement date for each exercise
  const exerciseLastImprovement = new Map<string, string>();
  const exerciseFirstSeen = new Map<string, string>();
  
  // Process workouts chronologically
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const name = exercise.name;
      
      // Record first time seeing this exercise
      if (!exerciseFirstSeen.has(name)) {
        exerciseFirstSeen.set(name, workout.date);
        exerciseLastImprovement.set(name, workout.date);
        continue;
      }
      
      // Check if this workout shows improvement
      const hasImproved = checkForImprovement(exercise, name, workouts, workout.date);
      
      if (hasImproved) {
        exerciseLastImprovement.set(name, workout.date);
      }
    }
  }
  
  // Calculate days since improvement and filter exercises that haven't improved
  const nonImprovingExercises = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const [name, lastImprovementDate] of exerciseLastImprovement.entries()) {
    const firstSeenDate = exerciseFirstSeen.get(name)!;
    
    // Skip exercises only seen once
    if (firstSeenDate === lastImprovementDate && 
        workouts.filter(w => w.exercises.some(e => e.name === name)).length <= 1) {
      continue;
    }
    
    const lastDate = new Date(lastImprovementDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysSinceImprovement = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceImprovement > 0) {
      nonImprovingExercises.push({
        name,
        daysSinceImprovement,
        lastImprovementDate
      });
    }
  }
  
  // Sort by days since improvement (descending) and return top exercises
  return nonImprovingExercises
    .sort((a, b) => b.daysSinceImprovement - a.daysSinceImprovement)
    .slice(0, count);
}

function checkForImprovement(currentExercise: Exercise, exerciseName: string, workouts: Workout[], currentDate: string) {
  // Get previous instances of this exercise
  const previousInstances: { exercise: Exercise; date: string }[] = [];
  
  for (const workout of workouts) {
    if (new Date(workout.date) >= new Date(currentDate)) break;
    
    for (const exercise of workout.exercises) {
      if (exercise.name === exerciseName) {
        previousInstances.push({ exercise, date: workout.date });
      }
    }
  }
  
  if (previousInstances.length === 0) return false;
  
  // Get the most recent previous instance
  const mostRecentPrevious = previousInstances[previousInstances.length - 1].exercise;
  
  // Check for improvement in weight, reps, or sets
  for (const currentSet of currentExercise.sets) {
    // Skip sets without weight
    if (!currentSet.weight) continue;
    
    let hasImprovement = true;
    
    // Look for a comparable set in the previous exercise
    for (const prevSet of mostRecentPrevious.sets) {
      if (!prevSet.weight) continue;
      
      // Skip sets with different units
      if (prevSet.weight.unit !== currentSet.weight.unit) continue;
      
      // Check if this set shows improvement
      const repsImproved = typeof currentSet.reps === 'number' && 
                          typeof prevSet.reps === 'number' && 
                          currentSet.reps > prevSet.reps;
                          
      const weightImproved = currentSet.weight.value > prevSet.weight.value;
      const setsImproved = currentSet.sets > prevSet.sets;
      
      // If no improvement on any metric, this set doesn't show improvement
      if (!repsImproved && !weightImproved && !setsImproved) {
        hasImprovement = false;
      }
    }
    
    if (hasImprovement) return true;
  }
  
  return false;
}