export interface Workout {
  date: string;
  exercises: Exercise[];
  note?: string;
}

export interface Exercise {
  name: string;
  sets: Set[];
  tags?: string[];
  note?: string;
}

export interface Set {
  sets: number;
  reps: number | 'Failure';
  weight?: {
    value: number;
    unit: string;
  };
}

export interface Goal {
  description: string;
  completed: boolean;
  date: string;
}

export interface WorkoutLog {
  goals: Goal[];
  workouts: Workout[];
}

export interface PersonalRecord {
  exercise: string;
  repMax: number;
  weight: {
    value: number;
    unit: string;
  };
  date: string;
}