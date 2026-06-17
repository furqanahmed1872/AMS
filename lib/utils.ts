import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getCurrentMonthYear(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function calculatePercentage(obtained: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((obtained / total) * 100)}%`;
}
