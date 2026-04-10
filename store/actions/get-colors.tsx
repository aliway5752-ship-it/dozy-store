import { Color } from "@/types";
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/colors`

const getColors = async (): Promise<Color[]> => {
    try {
        console.log("Fetching colors from URL:", URL);
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

export default getColors;