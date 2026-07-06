import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTicketId(id: string): string {
  if (!id) return '';
  return id.slice(0, 8);
}
