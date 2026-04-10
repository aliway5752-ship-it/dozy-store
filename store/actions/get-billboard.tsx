import { Billboard } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/billboards`

const getBillboard = async (id: string): Promise<Billboard | null> => {
    try {
        // إضافة cache: 'no-store' عشان صورة الـ Billboard تتحدث
        const res = await fetch(`${URL}/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        return null;
    }
}

export default getBillboard;