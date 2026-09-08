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

// 백엔드가 내려주는 이미지 URL(/api/images/...)은 상대경로라, 그대로 <img src>에 쓰면
// 프론트 서버(현재 페이지) 기준으로 요청돼서 깨짐. 백엔드 origin을 붙여서 절대경로로 변환.
export function toImageSrc(imageUrl: string): string {
    if (!imageUrl) return imageUrl;
    if (imageUrl.startsWith('http')) return imageUrl;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
    const origin = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

    return `${origin}${imageUrl}`;
}
