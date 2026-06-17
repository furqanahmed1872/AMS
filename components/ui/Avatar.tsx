import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps { name: string; size?: "sm" | "md" | "lg"; className?: string; }

const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
const colors = ["from-brand-500 to-brand-700", "from-violet-500 to-purple-700", "from-cyan-500 to-blue-600", "from-emerald-500 to-teal-700", "from-rose-500 to-pink-700"];

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div className={cn("rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white shrink-0", sizes[size], colors[colorIndex], className)}>
      {getInitials(name)}
    </div>
  );
}
