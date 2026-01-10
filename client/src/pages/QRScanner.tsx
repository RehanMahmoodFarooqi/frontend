import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Page Loading</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-accent" />
        </div>
      </div>
    </div>
  );
}
