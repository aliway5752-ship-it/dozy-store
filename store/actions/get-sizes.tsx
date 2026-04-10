import { Size } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/sizes`

const getSizes = async (): Promise<Size[]> => {
    try {
        const res = await fetch(URL, { cache: 'no-store' });
        if (!res.ok) {
            return [];
        }
        return res.json();
    } catch (error) {
        return [];
    }
}

export default getSizes;