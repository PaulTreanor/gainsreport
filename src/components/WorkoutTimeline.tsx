import { useEffect, useRef } from "react";
import { Workout, PersonalRecord } from "@/lib/types";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutTimelineProps {
  workouts: Workout[];
  personalRecords: PersonalRecord[];
}

export function WorkoutTimeline({ workouts, personalRecords }: WorkoutTimelineProps) {
  const endOfListRef = useRef<HTMLDivElement>(null);
  
  // Group workouts by week
  const workoutsByWeek = workouts.reduce<Record<string, Workout[]>>((acc, workout) => {
    const date = new Date(workout.date);
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);
    const weekKey = `${year}-W${weekNumber}`;
    
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    
    acc[weekKey].push(workout);
    return acc;
  }, {});
  
  // Function to get week number
  function getWeekNumber(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  // Format week title (Year - Week X)
  function formatWeekTitle(weekKey: string) {
    const [year, week] = weekKey.split('-W');
    return `${year} - Week ${week}`;
  }
  
  // Scroll to the end of the list (most recent workout) on initial render
  useEffect(() => {
    if (endOfListRef.current) {
      endOfListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      {Object.entries(workoutsByWeek).map(([weekKey, weekWorkouts]) => (
        <div key={weekKey} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white py-2 z-10 border-b">
            {formatWeekTitle(weekKey)}
          </h2>
          <div className="space-y-4">
            {weekWorkouts.map((workout) => (
              <WorkoutCard 
                key={workout.date} 
                workout={workout} 
                personalRecords={personalRecords} 
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={endOfListRef} />
    </div>
  );
}