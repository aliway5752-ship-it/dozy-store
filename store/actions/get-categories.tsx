import { Category } from "@/types";
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/categories`

const getCategories = async (): Promise<Category[]> => {
    try {
        console.log("Fetching categories from URL:", URL);
        const res = await fetch(URL, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!res.ok) {
            return [];
        }
        return res.json();
    } catch (error) {
        return [];
    }
}

export default getCategories;