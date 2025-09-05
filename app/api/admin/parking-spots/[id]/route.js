import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const spot = await db.parkingSpot.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: { where: { status: "ACTIVE" } },
            slips: true
          }
        }
      }
    });

    if (!spot || spot.ownerId !== token.id) {
      return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
    }

    return NextResponse.json({ parkingSpot: spot });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isAvailable, totalSpots } = body;

    // Check if the parking spot belongs to the user
    const existingSpot = await db.parkingSpot.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!existingSpot || existingSpot.ownerId !== token.id) {
      return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
    }

    // Build update data
    const data = {};
    if (typeof isAvailable === "boolean") {
      data.isAvailable = isAvailable;
    }
    if (totalSpots !== undefined) {
      const capacity = parseInt(totalSpots, 10);
      if (isNaN(capacity) || capacity < 0) {
        return NextResponse.json({ error: "Invalid totalSpots" }, { status: 400 });
      }
      // Fetch current occupied to validate
      const current = await db.parkingSpot.findUnique({ where: { id }, select: { occupiedSpots: true } });
      if (!current) {
        return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
      }
      if (current.occupiedSpots > capacity) {
        return NextResponse.json({ error: "totalSpots cannot be less than currently occupied spots" }, { status: 409 });
      }
      data.totalSpots = capacity;
    }

    const updatedSpot = await db.parkingSpot.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: "ACTIVE" }
            }
          }
        }
      }
    });

    return NextResponse.json({ parkingSpot: updatedSpot });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
