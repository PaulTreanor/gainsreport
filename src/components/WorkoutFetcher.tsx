import React, { useState, useEffect } from "react";
import { parseWorkoutLog, calculatePersonalRecords, calculateStreaks, calculateDaysSinceLastWorkout, getNonImprovingExercises } from "@/lib/parser";
import { WorkoutLog, PersonalRecord } from "@/lib/types";

interface WorkoutFetcherProps {
  url: string;
  children: (data: {
    workoutLog: WorkoutLog;
    personalRecords: PersonalRecord[];
    streakData: { currentStreak: number; longestStreak: number };
    daysSinceLastWorkout: number;
    nonImprovingExercises: Array<{
      name: string;
      daysSinceImprovement: number;
      lastImprovementDate: string;
    }>;
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function WorkoutFetcher({ url, children }: WorkoutFetcherProps) {
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({ goals: [], workouts: [] });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [daysSinceLastWorkout, setDaysSinceLastWorkout] = useState(0);
  const [nonImprovingExercises, setNonImprovingExercises] = useState<Array<{
    name: string;
    daysSinceImprovement: number;
    lastImprovementDate: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutLog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If URL is empty, use example data from the project
        let markdownContent;
        if (!url) {
          // Using the example data from src/data
          const response = await fetch('/src/data/example-log-file.md');
          markdownContent = await response.text();
        } else {
          // For GitHub URLs, use the raw content URL
          const fetchUrl = url.includes('github.com') && !url.includes('raw.githubusercontent.com') 
            ? url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/') 
            : url;
            
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch workout log (${response.status})`);
          }
          markdownContent = await response.text();
        }

        const parsedLog = parseWorkoutLog(markdownContent);
        setWorkoutLog(parsedLog);

        // Calculate insights
        const records = calculatePersonalRecords(parsedLog.workouts);
        setPersonalRecords(records);

        const streaks = calculateStreaks(parsedLog.workouts);
        setStreakData(streaks);

        const daysSince = calculateDaysSinceLastWorkout(parsedLog.workouts);
        setDaysSinceLastWorkout(daysSince);

        const nonImproving = getNonImprovingExercises(parsedLog.workouts);
        setNonImprovingExercises(nonImproving);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching workout log:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutLog();
  }, [url]);

  return (
    <>
      {children({
        workoutLog,
        personalRecords,
        streakData,
        daysSinceLastWorkout,
        nonImprovingExercises,
        isLoading,
        error,
      })}
    </>
  );
}