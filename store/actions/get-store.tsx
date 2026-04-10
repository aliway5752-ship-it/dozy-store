import { Store } from "@/types";
import { API_URL } from '@/lib/config';

const URL = API_URL;

const getStore = async (): Promise<Store | null> => {
    try {
        console.log("Fetching store from URL:", URL);
        const res = await fetch(URL, { 
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
};

export default getStore;
