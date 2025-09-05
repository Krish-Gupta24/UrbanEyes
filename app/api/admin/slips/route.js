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

    const whereClause = { ownerId: userId };
    if (status) {
      whereClause.status = status;
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
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // Get booking details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        parkingSpot: true
      }
    });

    if (!booking || booking.ownerId !== token.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if slip already exists
    const existingSlip = await db.parkingSlip.findUnique({
      where: { bookingId }
    });

    if (existingSlip) {
      return NextResponse.json({ error: "Slip already exists for this booking" }, { status: 409 });
    }

    // Generate unique slip number
    const slipNumber = `PS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Generate QR code
    const qrData = JSON.stringify({
      slipNumber,
      bookingId,
      spotTitle: booking.parkingSpot.title,
      validUntil: booking.endTime.toISOString()
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    // Create slip
    const slip = await db.parkingSlip.create({
      data: {
        slipNumber,
        qrCode,
        validUntil: booking.endTime,
        bookingId,
        parkingSpotId: booking.parkingSpotId,
        ownerId: token.id
      },
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
        }
      }
    });

    return NextResponse.json({ slip }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
