import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutFetcher } from "@/components/WorkoutFetcher";
import { WorkoutTimeline } from "@/components/WorkoutTimeline";
import { InsightsTab } from "@/components/InsightsTab";
import { GoalsList } from "@/components/GoalsList";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

function App() {
  // Use GitHub URL to fetch workout data
  const [workoutLogUrl] = useState<string>("https://raw.githubusercontent.com/PaulTreanor/workout-log/main/2025.md");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <WorkoutFetcher url={workoutLogUrl}>
          {({
            workoutLog,
            personalRecords,
            streakData,
            daysSinceLastWorkout,
            nonImprovingExercises,
            isLoading,
            error,
          }) => {
            if (isLoading) {
              return (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              );
            }

            if (error) {
              return (
                <div className="max-w-2xl mx-auto p-8 text-center">
                  <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    <h2 className="text-lg font-medium">Error loading workout data</h2>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              );
            }

            return (
              <div className="container mx-auto py-6">
                {workoutLog.goals.length > 0 && (
                  <div className="mb-8">
                    <GoalsList goals={workoutLog.goals} />
                  </div>
                )}

                <Tabs defaultValue="workouts" className="w-full">
                  <div className="flex justify-center mb-6">
                    <TabsList>
                      <TabsTrigger value="workouts">Workout Log</TabsTrigger>
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="workouts" className="mt-0">
                    <WorkoutTimeline 
                      workouts={workoutLog.workouts} 
                      personalRecords={personalRecords} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="insights" className="mt-0">
                    <InsightsTab 
                      workouts={workoutLog.workouts}
                      personalRecords={personalRecords}
                      streakData={streakData}
                      daysSinceLastWorkout={daysSinceLastWorkout}
                      nonImprovingExercises={nonImprovingExercises}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            );
          }}
        </WorkoutFetcher>
      </main>
    </div>
  );
}

export default App;