import { Workout, PersonalRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkoutCardProps {
  workout: Workout;
  personalRecords: PersonalRecord[];
}

export function WorkoutCard({ workout, personalRecords }: WorkoutCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Check if a set is a personal record
  const isPR = (exerciseName: string, reps: number | "Failure", weight?: { value: number; unit: string }) => {
    if (reps === "Failure" || !weight) return false;
    
    return personalRecords.some(
      (pr) =>
        pr.exercise === exerciseName &&
        pr.repMax === reps &&
        pr.weight.value === weight.value &&
        pr.weight.unit === weight.unit &&
        pr.date === workout.date
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{formatDate(workout.date)}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <li key={index} className="border-b pb-2 last:border-b-0">
              <div className="flex items-start justify-between">
                <span className="font-medium">{exercise.name}</span>
                {exercise.tags && (
                  <div className="flex gap-1">
                    {exercise.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ul className="mt-1 text-sm text-gray-600">
                {exercise.sets.map((set, setIndex) => (
                  <li key={setIndex} className="flex items-center gap-2">
                    <span>
                      {set.sets}×{set.reps === "Failure" ? "F" : set.reps}
                      {set.weight && ` @ ${set.weight.value}${set.weight.unit}`}
                    </span>
                    {isPR(exercise.name, set.reps, set.weight) && (
                      <Badge variant="success" className="ml-1">
                        PR
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
              {exercise.note && (
                <p className="mt-1 text-sm italic text-gray-500">{exercise.note}</p>
              )}
            </li>
          ))}
        </ul>
        {workout.note && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm italic">
            {workout.note}
          </div>
        )}
      </CardContent>
    </Card>
  );
}