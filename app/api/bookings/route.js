import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { parkingSpotId, startTime, endTime, customerName, customerEmail, customerPhone, carNumber } = body;

    if (!parkingSpotId || !startTime || !endTime || !customerName || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get parking spot details
    const spot = await db.parkingSpot.findUnique({
      where: { id: parkingSpotId }
    });

    if (!spot) {
      return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
    }

    // Calculate total price
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    const totalPrice = hours * spot.pricePerHour;

    // Check if spot is available
    if (spot.occupiedSpots >= spot.totalSpots) {
      return NextResponse.json({ error: "Parking spot is full" }, { status: 409 });
    }

    // Create booking and update parking spot in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          parkingSpotId,
          ownerId: spot.ownerId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          totalPrice,
          customerName,
          customerEmail,
          customerPhone,
          carNumber
        }
      });

      // Update parking spot occupancy
      await tx.parkingSpot.update({
        where: { id: parkingSpotId },
        data: {
          occupiedSpots: { increment: 1 }
        }
      });

      return booking;
    });

    return NextResponse.json({ 
      success: true,
      booking: result,
      totalPrice 
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

