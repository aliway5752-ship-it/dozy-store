import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing data", { status: 400, headers: corsHeaders });
    }

    const existingCustomer = await prismadb.customer.findUnique({
      where: {
        email
      }
    });

    if (existingCustomer) {
      return new NextResponse("User already exists", { status: 400, headers: corsHeaders });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await prismadb.customer.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    return NextResponse.json({ id: customer.id, name: customer.name, email: customer.email }, { headers: corsHeaders });
  } catch (error) {
    console.log('[CUSTOMER_REGISTER]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
