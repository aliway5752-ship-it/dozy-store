import { Category } from "@/types";
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/categories`

const getCategory = async (id: string): Promise<Category | null> => {
    try {
        console.log("Fetching category from URL:", `${URL}/${id}`);
        const res = await fetch(`${URL}/${id}`, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        return null;
    }
}

export default getCategory;