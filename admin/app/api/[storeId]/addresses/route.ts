import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/[storeId]/addresses?userId=xxx
export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400, headers: corsHeaders });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders });
    }

    const addresses = await prismadb.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json(addresses, { headers: corsHeaders });
  } catch (error) {
    console.error("[ADDRESSES_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500, headers: corsHeaders });
  }
}

// POST /api/[storeId]/addresses
export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await req.json();
    
    const {
      userId,
      fullName,
      phoneNumber,
      governorate,
      city,
      district,
      streetName,
      buildingNumber,
      floor,
      apartment,
      landmark,
      isDefault,
    } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400, headers: corsHeaders });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders });
    }

    // Validate required fields
    if (!fullName || !phoneNumber || !governorate || !city || !streetName || !buildingNumber) {
      return NextResponse.json({ 
        error: "Required fields missing: fullName, phoneNumber, governorate, city, streetName, buildingNumber" 
      }, { status: 400, headers: corsHeaders });
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await prismadb.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prismadb.address.create({
      data: {
        userId,
        fullName,
        phoneNumber,
        governorate,
        city,
        district: district || "",
        streetName,
        buildingNumber,
        floor: floor || "",
        apartment: apartment || "",
        landmark: landmark || "",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address, { headers: corsHeaders });
  } catch (error) {
    console.error("[ADDRESSES_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500, headers: corsHeaders });
  }
}

// PUT /api/[storeId]/addresses
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await req.json();
    
    const {
      id,
      userId,
      fullName,
      phoneNumber,
      governorate,
      city,
      district,
      streetName,
      buildingNumber,
      floor,
      apartment,
      landmark,
      isDefault,
    } = body;

    if (!storeId || !id || !userId) {
      return NextResponse.json({ error: "Store ID, Address ID, and User ID are required" }, { status: 400, headers: corsHeaders });
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await prismadb.address.updateMany({
        where: { userId, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const address = await prismadb.address.update({
      where: { id },
      data: {
        fullName: fullName || undefined,
        phoneNumber: phoneNumber || undefined,
        governorate: governorate || undefined,
        city: city || undefined,
        district: district || undefined,
        streetName: streetName || undefined,
        buildingNumber: buildingNumber || undefined,
        floor: floor || undefined,
        apartment: apartment || undefined,
        landmark: landmark || undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    });

    return NextResponse.json(address, { headers: corsHeaders });
  } catch (error) {
    console.error("[ADDRESSES_PUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/[storeId]/addresses?id=xxx
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!storeId || !id) {
      return NextResponse.json({ error: "Store ID and Address ID are required" }, { status: 400, headers: corsHeaders });
    }

    await prismadb.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[ADDRESSES_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500, headers: corsHeaders });
  }
}
