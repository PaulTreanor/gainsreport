import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalRecord, Workout } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface InsightsTabProps {
  workouts: Workout[];
  personalRecords: PersonalRecord[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
  };
  daysSinceLastWorkout: number;
  nonImprovingExercises: Array<{
    name: string;
    daysSinceImprovement: number;
    lastImprovementDate: string;
  }>;
}

export function InsightsTab({
  personalRecords,
  streakData,
  daysSinceLastWorkout,
  nonImprovingExercises,
}: InsightsTabProps) {
  // Get unique exercise names
  const exerciseNames = Array.from(
    new Set(personalRecords.map((pr) => pr.exercise))
  ).sort();

  // State for expanded exercise sections
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  const toggleExercise = (exerciseName: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseName]: !prev[exerciseName],
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-3xl font-bold">{streakData.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current streak (weeks)</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{streakData.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Longest streak (weeks)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{daysSinceLastWorkout}</div>
            <div className="text-sm text-muted-foreground">
              Days since last workout
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercises Needing Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          {nonImprovingExercises.length > 0 ? (
            <ul className="space-y-2">
              {nonImprovingExercises.map((exercise, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="font-medium">{exercise.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {exercise.daysSinceImprovement} days since improvement
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No exercises to improve at the moment.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exerciseNames.map((exerciseName) => {
              const exercisePRs = personalRecords.filter(
                (pr) => pr.exercise === exerciseName
              );
              const isExpanded = expandedExercises[exerciseName] || false;

              return (
                <Collapsible key={exerciseName} open={isExpanded}>
                  <CollapsibleTrigger
                    onClick={() => toggleExercise(exerciseName)}
                    className="flex items-center justify-between w-full text-left font-medium py-2 border-b"
                  >
                    <span>{exerciseName}</span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="pb-1">Reps</th>
                          <th className="pb-1">Weight</th>
                          <th className="pb-1">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercisePRs
                          .sort((a, b) => a.repMax - b.repMax)
                          .map((pr) => (
                            <tr key={`${pr.exercise}-${pr.repMax}`}>
                              <td>{pr.repMax}</td>
                              <td>
                                {pr.weight.value}
                                {pr.weight.unit}
                              </td>
                              <td>{formatDate(pr.date)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}