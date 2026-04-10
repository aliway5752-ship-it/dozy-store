import { Product } from "@/types";

const URL = `https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/products`

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