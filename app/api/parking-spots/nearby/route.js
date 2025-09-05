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
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 2; // Default 2km radius

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
    }

    // Get all available parking spots
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

    // Filter spots within the specified radius
    const nearbySpots = allSpots
      .filter(spot => {
        if (!spot.latitude || !spot.longitude) return false;
        const distance = calculateDistance(lat, lng, spot.latitude, spot.longitude);
        return distance <= radius;
      })
      .map(spot => {
        const distance = calculateDistance(lat, lng, spot.latitude, spot.longitude);
        return {
          ...spot,
          distance: Math.round(distance * 1000) / 1000, // Round to 3 decimal places
          availableSpots: spot.totalSpots - spot.occupiedSpots
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    return NextResponse.json({ 
      spots: nearbySpots,
      totalFound: nearbySpots.length,
      searchCenter: { lat, lng },
      radius: radius
    });
  } catch (error) {
    console.error("Error fetching nearby parking spots:", error);
    return NextResponse.json({ error: "Failed to fetch nearby parking spots" }, { status: 500 });
  }
}
