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

    // Create booking
    const booking = await db.booking.create({
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

    return NextResponse.json({ 
      success: true,
      booking,
      totalPrice 
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

