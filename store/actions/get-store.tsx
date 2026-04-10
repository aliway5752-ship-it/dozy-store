import { Store } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const getStore = async (): Promise<Store | null> => {
    try {
        const res = await fetch(URL, { cache: 'no-store' });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        return null;
    }
};

export default getStore;
