import { Size } from "@/types";
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/sizes`

const getSizes = async (): Promise<Size[]> => {
    try {
        console.log("Fetching sizes from URL:", URL);
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

export default getSizes;