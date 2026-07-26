"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parentLoginAction } from "@/lib/parent-portal/actions";

export function ParentLoginForm({ shareToken }: { shareToken: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const result = await parentLoginAction(shareToken, pin);
    if (result.success) {
      router.refresh();
    } else {
      setLoading(false);
      setError(result.error ?? "Incorrect PIN.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-lg font-semibold text-white">Parent Portal</h1>
          <p className="text-sm text-white/50 mt-1">
            Enter the PIN provided by your academy to view your child&apos;s
            progress.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            icon={<Lock className="w-4 h-4" />}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={error}
            placeholder="••••"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit} loading={loading} disabled={!pin}>
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
