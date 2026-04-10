import { Billboard } from "@/types";
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/billboards`

const getBillboard = async (id: string): Promise<Billboard | null> => {
    try {
        console.log("Fetching billboard from URL:", `${URL}/${id}`);
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

export default getBillboard;