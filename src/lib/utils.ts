import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export function formatPercent(percent: number) {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
}
