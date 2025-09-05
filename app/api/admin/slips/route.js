import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(request) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const parkingSpotId = searchParams.get("spotId");

    const whereClause = { ownerId: userId };
    if (status) {
      whereClause.status = status;
    }
    if (parkingSpotId) {
      whereClause.parkingSpotId = parkingSpotId;
    }

    const slips = await db.parkingSlip.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            parkingSpot: {
              select: {
                title: true,
                address: true
              }
            }
          }
        },
        parkingSpot: {
          select: {
            title: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ slips });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("=== SLIP GENERATION API CALLED ===");
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      console.log("Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, parkingSpotId, validHours, carNumber } = body;
    console.log("Request body:", { bookingId, parkingSpotId, validHours });

    // Branch 1: slip for a booking (existing flow)
    if (bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: {
          parkingSpot: true
        }
      });

      if (!booking || booking.ownerId !== token.id) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const existingSlip = await db.parkingSlip.findUnique({ where: { bookingId } });
      if (existingSlip) {
        return NextResponse.json({ error: "Slip already exists for this booking" }, { status: 409 });
      }

      const slipNumber = `PS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const qrData = JSON.stringify({
        slipNumber,
        bookingId,
        spotTitle: booking.parkingSpot.title,
        validUntil: booking.endTime.toISOString(),
        carNumber: carNumber || booking.carNumber || booking.customerName
      });
      const qrCode = await QRCode.toDataURL(qrData);

      const slip = await db.parkingSlip.create({
        data: {
          slipNumber,
          qrCode,
          validUntil: booking.endTime,
          bookingId,
          parkingSpotId: booking.parkingSpotId,
          ownerId: token.id,
          carNumber: carNumber || booking.carNumber || null
        },
        include: {
          booking: {
            include: {
              parkingSpot: {
                select: { title: true, address: true }
              }
            }
          }
        }
      });

      return NextResponse.json({ slip }, { status: 201 });
    }

    // Branch 2: manual slip for a parking spot (no booking)
    if (!parkingSpotId) {
      console.log("No parkingSpotId provided for manual slip");
      return NextResponse.json({ error: "parkingSpotId is required for manual slip" }, { status: 400 });
    }

    console.log("Creating manual slip for parking spot:", parkingSpotId);
    
    // Ensure spot belongs to owner
    const spot = await db.parkingSpot.findUnique({ where: { id: parkingSpotId } });
    console.log("Found spot:", spot ? "Yes" : "No", spot?.ownerId === token.id ? "Owner match" : "Owner mismatch");
    
    if (!spot || spot.ownerId !== token.id) {
      return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
    }

    if (spot.totalSpots <= 0) {
      return NextResponse.json({ error: "Set total spots before adding slips" }, { status: 400 });
    }
    if (spot.occupiedSpots >= spot.totalSpots) {
      return NextResponse.json({ error: "No free spots available" }, { status: 409 });
    }

    const slipNumber = `PS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const hours = validHours || 12;
    const validUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    const qrData = JSON.stringify({ 
      slipNumber, 
      parkingSpotId, 
      validUntil: validUntil.toISOString(),
      carNumber: carNumber || null
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Transaction: create slip and increment occupiedSpots
    console.log("Starting transaction to create slip and update occupancy");
    const result = await db.$transaction(async (tx) => {
      const updated = await tx.parkingSpot.update({
        where: { id: parkingSpotId },
        data: { occupiedSpots: { increment: 1 } }
      });
      console.log("Updated spot occupancy:", updated.occupiedSpots, "/", updated.totalSpots);
      
      if (updated.occupiedSpots > updated.totalSpots) {
        throw new Error("Capacity exceeded");
      }
      
      const slip = await tx.parkingSlip.create({
        data: {
          slipNumber,
          qrCode,
          validUntil,
          bookingId: null,
          parkingSpotId,
          ownerId: token.id,
          carNumber: carNumber || null
        }
      });
      console.log("Created slip:", slip.slipNumber);
      return slip;
    });

    console.log("Manual slip created successfully");
    return NextResponse.json({ slip: result }, { status: 201 });
  } catch (error) {
    console.error("Slip generation error:", error);
    const message = error?.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
