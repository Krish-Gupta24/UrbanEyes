import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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
