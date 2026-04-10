import prismadb from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from "next/server"

export async function PATCH (
    req: Request,
    { params }: { params: Promise<{ storeId: string }>}
) {
    try {
        const { userId } = await auth();
        const { storeId } = await params;
        const body = await req.json();

        // استلام الاسم وسعر الشحن من المدخلات
        const { name, shippingPrice, billboardId } = body;

        if (!userId) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if(!storeId) {
            return NextResponse.json({ error: "Store id is required" }, { status: 400 });
        }

        // تحديث بيانات المتجر بما فيها سعر الشحن واللوحة الإعلانية
        const store = await prismadb.store.updateMany({
            where: {
                id: storeId,
                userId
            },
            data: {
                name,
                shippingPrice: parseInt(shippingPrice) || 0,
                billboardId: billboardId || null
            }
        });

        return NextResponse.json(store);
    } catch (err) {
        console.log('[STORE_PATCH]', err);
        // إرجاع JSON دايماً لتجنب إيرور الـ Token I في المتجر
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE (
    req: Request,
    { params }: { params: Promise<{ storeId: string }>}
) {
    try {
        const { userId } = await auth();
        const { storeId } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }

        if(!storeId) {
            return NextResponse.json({ error: "Store id is required" }, { status: 400 });
        }

        const store = await prismadb.store.deleteMany({
            where: {
                id: storeId,
                userId
            }
        });

        return NextResponse.json(store);
    } catch (err) {
        console.log('[STORE_DELETE]', err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}