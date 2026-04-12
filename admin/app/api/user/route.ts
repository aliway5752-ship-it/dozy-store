import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prismadb.user.findUnique({
      where: { clerkId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1
        }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    const body = await req.json();

    const { firstName, lastName, phone, address, profileImageUrl } = body;

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prismadb.user.update({
      where: { clerkId },
      data: {
        firstName,
        lastName,
        phone,
        profileImageUrl,
      }
    });

    if (address) {
      await prismadb.address.upsert({
        where: {
          id: body.addressId || "new-address",
        },
        update: {
          streetName: address,
        },
        create: {
          userId: user.id,
          streetName: address,
          city: "Cairo", // Default
          isDefault: true,
          fullName: body.fullName || "Home",
        }
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log("[USER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
