import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const body = await req.json();
        const { userId, phone, alternativePhone, fullName, streetName, buildingNumber, city, district, governorate, landmark } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders });
        }

        // Check if user already exists
        const existingUser = await prismadb.user.findUnique({
            where: { clerkId: userId }
        });

        if (existingUser) {
            // Update existing user with phone
            await prismadb.user.update({
                where: { clerkId: userId },
                data: { phone }
            });

            // Create or update default address
            const existingAddress = await prismadb.address.findFirst({
                where: { userId: existingUser.id, isDefault: true }
            });

            if (existingAddress) {
                await prismadb.address.update({
                    where: { id: existingAddress.id },
                    data: {
                        fullName: fullName || existingAddress.fullName,
                        streetName: streetName || existingAddress.streetName,
                        buildingNumber: buildingNumber || existingAddress.buildingNumber,
                        city: city || existingAddress.city,
                        district: district || existingAddress.district,
                        governorate: governorate || existingAddress.governorate,
                        landmark: landmark || existingAddress.landmark,
                        phoneNumber: alternativePhone || phone || existingAddress.phoneNumber
                    }
                });
            } else {
                await prismadb.address.create({
                    data: {
                        userId: existingUser.id,
                        fullName: fullName || "",
                        phoneNumber: alternativePhone || phone || "",
                        governorate: governorate || "",
                        city: city || "",
                        district: district || "",
                        streetName: streetName || "",
                        buildingNumber: buildingNumber || "",
                        landmark: landmark || "",
                        isDefault: true
                    }
                });
            }
        } else {
            // This shouldn't happen since Clerk should sync users, but handle it
            return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (err) {
        console.log('[PROFILE_POST]', err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders });
        }

        const user = await prismadb.user.findUnique({
            where: { clerkId: userId },
            include: {
                addresses: {
                    where: { isDefault: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json(user, { headers: corsHeaders });
    } catch (err) {
        console.log('[PROFILE_GET]', err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
    }
}
