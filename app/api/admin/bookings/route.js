import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function GET(request) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id;

    const bookings = await db.booking.findMany({
      where: { ownerId: userId },
      include: {
        parkingSpot: {
          select: {
            title: true,
            address: true
          }
        },
        slip: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
