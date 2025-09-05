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
    console.log("=== PARKING SPOT API CALLED ===");
    
    const token = await getToken({ req: request });
    console.log("Token:", token ? "Found" : "Not found");
    
    if (!token) {
      console.log("No token found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    if (token.role !== "OWNER") {
      console.log("Not an owner, role:", token.role);
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Request body:", body);
    
    const { title, description, address, latitude, longitude, pricePerHour, totalSpots } = body;

    if (!title || !address || !latitude || !longitude || !pricePerHour) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate numeric values
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const price = parseFloat(pricePerHour);
    const capacity = totalSpots !== undefined ? parseInt(totalSpots, 10) : 0;

    if (isNaN(lat) || isNaN(lng) || isNaN(price) || isNaN(capacity)) {
      console.log("Invalid numeric values");
      return NextResponse.json({ error: "Invalid numeric values" }, { status: 400 });
    }

    console.log("Creating parking spot with data:", {
      title,
      description,
      address,
      latitude: lat,
      longitude: lng,
      pricePerHour: price,
      ownerId: token.id,
      totalSpots: capacity,
      occupiedSpots: 0
    });

    const parkingSpot = await db.parkingSpot.create({
      data: {
        title,
        description,
        address,
        latitude: lat,
        longitude: lng,
        pricePerHour: price,
        ownerId: token.id,
        totalSpots: capacity,
        occupiedSpots: 0
      }
    });

    console.log("Parking spot created successfully:", parkingSpot);
    return NextResponse.json({ 
      success: true,
      parkingSpot 
    }, { status: 201 });
  } catch (error) {
    console.error("Parking spot creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create parking spot", 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
