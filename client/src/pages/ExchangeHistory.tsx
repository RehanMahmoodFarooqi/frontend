import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import ExchangeRequests from "@/components/ExchangeRequests";

export default function ExchangeHistory() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Exchange Center</h1>

      <ExchangeRequests />

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">History</h2>
        <p className="text-muted-foreground">Past exchanges will appear here.</p>
        {/* Could implement full history list here if needed */}
      </div>
    </div>
  );
}
