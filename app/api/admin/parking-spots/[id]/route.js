import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isAvailable } = body;

    // Check if the parking spot belongs to the user
    const existingSpot = await db.parkingSpot.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!existingSpot || existingSpot.ownerId !== token.id) {
      return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
    }

    // Update the parking spot
    const updatedSpot = await db.parkingSpot.update({
      where: { id },
      data: { isAvailable },
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
