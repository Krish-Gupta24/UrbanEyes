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

    const parkingSpots = await db.parkingSpot.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: "ACTIVE" }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ parkingSpots });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, address, latitude, longitude, pricePerHour } = body;

    if (!title || !address || !latitude || !longitude || !pricePerHour) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parkingSpot = await db.parkingSpot.create({
      data: {
        title,
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        pricePerHour: parseFloat(pricePerHour),
        ownerId: token.id
      }
    });

    return NextResponse.json({ parkingSpot }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
