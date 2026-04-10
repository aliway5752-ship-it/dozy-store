import { Product } from "@/types";
import qs from 'query-string';
import { API_URL } from '@/lib/config';

const URL = `${API_URL}/products`;

interface Query {
    categoryId?: string;
    colorId?: string;
    sizeId?: string;
    isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
    try {
        console.log("Fetching products from URL:", URL);
        const url = qs.stringifyUrl({
            url: URL,
            query: {
                colorId: query.colorId,
                sizeId: query.sizeId,
                categoryId: query.categoryId,
                isFeatured: query.isFeatured
            }
        });

        console.log("Final products URL:", url);
        const res = await fetch(url, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!res.ok) {
            console.log("Products fetch failed with status:", res.status);
            return [];
        }
        const data = await res.json();
        console.log("Products API response:", data);
        console.log("Products count:", Array.isArray(data) ? data.length : 'not an array');
        return data;
    } catch (error) {
        console.log("Products fetch error:", error);
        return [];
    }
}

export default getProducts;