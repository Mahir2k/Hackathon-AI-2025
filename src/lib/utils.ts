import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLLEGE_BY_DEPARTMENT: Record<string, string> = {
  "Computer Science": "rceas",
  "Mechanical Engineering": "rceas",
  "Electrical Engineering": "rceas",
  "Civil Engineering": "rceas",
  "Chemical Engineering": "rceas",
  Business: "business",
  Economics: "cas",
  Psychology: "cas",
  Biology: "cas",
};

export function getCollegeForDepartment(
  department: string | null | undefined
): string | null {
  if (!department) return null;
  return COLLEGE_BY_DEPARTMENT[department] ?? null;
}
