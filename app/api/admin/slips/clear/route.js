import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function DELETE(request) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id;

    // Clear all data in a transaction
    await db.$transaction(async (tx) => {
      // Delete all slips for this owner
      await tx.parkingSlip.deleteMany({
        where: { ownerId: userId }
      });

      // Delete all bookings for this owner
      await tx.booking.deleteMany({
        where: { ownerId: userId }
      });

      // Reset all parking spots to 0 occupied spots
      await tx.parkingSpot.updateMany({
        where: { ownerId: userId },
        data: { occupiedSpots: 0 }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "All data cleared successfully" 
    });
  } catch (error) {
    console.error("Clear data error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
