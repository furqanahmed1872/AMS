"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, Shield, Users, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginAction } from "@/lib/auth/actions";

type Role = "admin" | "teacher";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const result = await loginAction(role, password);

    if (result.success) {
      router.push("/app/dashboard");
      // intentionally not resetting `loading` here — the redirect plus
      // the bootstrap fetch in app/app/layout.tsx covers the transition,
      // so this button stays in its loading state until the new page is ready.
    } else {
      setLoading(false);
      setError(result.error ?? "Incorrect password.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Back to home
        </Link>

        <div className="glass-card p-8 animate-scale-in">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-glow mb-4">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold font-display text-white">Superior Academy</h1>
            <p className="text-white/40 text-sm mt-1">Management System</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="form-label">Sign in as</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-2 rounded-xl">
              {([
                { value: "admin" as Role, label: "Admin", icon: <Shield size={15} /> },
                { value: "teacher" as Role, label: "Teacher", icon: <Users size={15} /> },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setRole(opt.value); setError(""); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    role === opt.value ? "bg-brand-600 text-white shadow-glow" : "text-white/50 hover:text-white"
                  )}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <Input
              label={`${role === "admin" ? "Admin" : "Teacher"} Password`}
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              iconRight={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/40 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              error={error}
            />
          </div>

          <Button className="w-full" loading={loading} onClick={handleLogin}>
            Sign In as {role === "admin" ? "Admin" : "Teacher"}
          </Button>

          <p className="text-center text-xs text-white/30 mt-6">
            Academy Management System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
