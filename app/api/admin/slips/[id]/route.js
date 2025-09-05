import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, revenue } = body;

    // Fetch slip with spot and owner validation
    const slip = await db.parkingSlip.findUnique({
      where: { id },
      include: {
        parkingSpot: true,
        booking: true
      }
    });

    if (!slip || slip.ownerId !== token.id) {
      return NextResponse.json({ error: "Slip not found" }, { status: 404 });
    }

    if (action === "complete") {
      // Calculate revenue based on booking or manual slip
      let calculatedRevenue = 0;
      
      if (slip.booking) {
        // For booking-based slips, use the booking's total price
        calculatedRevenue = slip.booking.totalPrice;
      } else {
        // For manual slips, calculate based on hours and spot price
        const hoursUsed = (new Date() - new Date(slip.createdAt)) / (1000 * 60 * 60);
        calculatedRevenue = Math.ceil(hoursUsed) * slip.parkingSpot.pricePerHour;
      }

      // Use provided revenue if available, otherwise use calculated
      const finalRevenue = revenue || calculatedRevenue;

      // Transaction: complete slip and decrement occupiedSpots
      const result = await db.$transaction(async (tx) => {
        // Update slip status and revenue
        const updatedSlip = await tx.parkingSlip.update({
          where: { id },
          data: {
            status: "COMPLETED",
            revenue: finalRevenue,
            completedAt: new Date()
          }
        });

        // Decrement occupied spots
        await tx.parkingSpot.update({
          where: { id: slip.parkingSpotId },
          data: {
            occupiedSpots: { decrement: 1 }
          }
        });

        // Ensure it doesn't go negative
        await tx.parkingSpot.updateMany({
          where: { id: slip.parkingSpotId, occupiedSpots: { lt: 0 } },
          data: { occupiedSpots: 0 }
        });

        return updatedSlip;
      });

      return NextResponse.json({ 
        success: true, 
        slip: result,
        revenue: finalRevenue 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Slip completion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch slip with spot and owner validation
    const slip = await db.parkingSlip.findUnique({
      where: { id },
      select: { id: true, ownerId: true, parkingSpotId: true }
    });

    if (!slip || slip.ownerId !== token.id) {
      return NextResponse.json({ error: "Slip not found" }, { status: 404 });
    }

    // Transaction: delete slip and decrement occupiedSpots (min 0)
    await db.$transaction(async (tx) => {
      await tx.parkingSlip.delete({ where: { id } });
      await tx.parkingSpot.update({
        where: { id: slip.parkingSpotId },
        data: {
          occupiedSpots: { decrement: 1 }
        }
      });
      // Optional: ensure it doesn't go negative (in case of data drift)
      await tx.parkingSpot.updateMany({
        where: { id: slip.parkingSpotId, occupiedSpots: { lt: 0 } },
        data: { occupiedSpots: 0 }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
