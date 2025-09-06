import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export async function GET(request) {
  try {
    // Get all available parking spots without any distance filtering
    const allSpots = await db.parkingSpot.findMany({
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

    // Transform spots to include availableSpots and set distance to 0
    const spots = allSpots.map(spot => ({
      ...spot,
      distance: 0, // No distance calculation needed
      availableSpots: spot.totalSpots - spot.occupiedSpots
    }));

    return NextResponse.json({ 
      spots: spots,
      totalFound: spots.length
    });
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    return NextResponse.json({ error: "Failed to fetch parking spots" }, { status: 500 });
  }
}
