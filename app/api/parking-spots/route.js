import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const spots = await db.parkingSpot.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        pricePerHour: true,
        totalSpots: true,
        occupiedSpots: true,
        isAvailable: true
      }
    });

    console.log("Main API - Found spots:", spots.length);
    console.log("Sample spot:", spots[0]);

    return NextResponse.json({ spots });
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    return NextResponse.json({ error: "Failed to fetch parking spots" }, { status: 500 });
  }
}

