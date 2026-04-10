import { Product } from "@/types";
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/products`

const getProduct = async (id: string): Promise<Product | null> => {
    try {
        console.log("Fetching product from URL:", `${URL}/${id}`);
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

export default getProduct;