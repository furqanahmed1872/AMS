import { GraduationCap } from "lucide-react";

// Next.js wraps app/app/layout.tsx + whichever page is being navigated to
// in a Suspense boundary using this file as the fallback. It's shown for
// exactly as long as the layout's await getSession() + await
// getAcademyBootstrapData() take — once that resolves, this is replaced
// by the real, fully-populated page in a single swap.
export default function AppLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-glow animate-pulse">
          <GraduationCap size={28} className="text-white" />
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
          <span className="ml-1">Loading your academy…</span>
        </div>
      </div>
    </div>
  );
}
