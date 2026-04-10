import { Product } from "@/types";

const URL = `https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/products`

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