import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, password, role } = body || {};

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: role === "OWNER" ? "OWNER" : "REGULAR",
      },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


