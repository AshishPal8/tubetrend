import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, "");
  const wordsPerMin = 200;
  const wordCount = plainText.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMin);
}

export function truncateTextByWords(text: string, wordLimit: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
}
