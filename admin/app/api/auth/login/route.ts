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
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400, headers: corsHeaders });
    }

    const customer = await prismadb.customer.findUnique({
      where: {
        email
      }
    });

    if (!customer || !customer.password) {
      return new NextResponse("Invalid credentials", { status: 401, headers: corsHeaders });
    }

    const isCorrectPassword = await bcrypt.compare(password, customer.password);

    if (!isCorrectPassword) {
      return new NextResponse("Invalid credentials", { status: 401, headers: corsHeaders });
    }

    return NextResponse.json({ id: customer.id, name: customer.name, email: customer.email }, { headers: corsHeaders });
  } catch (error) {
    console.log('[CUSTOMER_LOGIN]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
