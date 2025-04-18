import { Dumbbell } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6" />
          <h1 className="text-xl font-bold tracking-tight">GainsReport</h1>
        </div>
      </div>
    </header>
  );
}