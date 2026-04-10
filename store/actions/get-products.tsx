import { Product } from "@/types";
import qs from 'query-string';

const URL = `https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/products`;

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
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            return [];
        }
        return res.json();
    } catch (error) {
        return [];
    }
}

export default getProducts;