// Updated Store ID to: 05f25ff6-71b1-4de2-90a8-369b098b1f12
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}