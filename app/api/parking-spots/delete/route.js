import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";

export async function DELETE(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spotId = searchParams.get("id");

    if (!spotId) {
      return NextResponse.json({ error: "Parking spot ID is required" }, { status: 400 });
    }

    const userId = token.id;

    // Check if the parking spot exists and belongs to the user
    const spot = await db.parkingSpot.findFirst({
      where: {
        id: spotId,
        ownerId: userId
      }
    });

    if (!spot) {
      return NextResponse.json({ error: "Parking spot not found or unauthorized" }, { status: 404 });
    }

    // Delete the parking spot and all related data in a transaction
    await db.$transaction(async (tx) => {
      // Delete related bookings first
      await tx.booking.deleteMany({
        where: { parkingSpotId: spotId }
      });

      // Delete related slips
      await tx.parkingSlip.deleteMany({
        where: { parkingSpotId: spotId }
      });

      // Delete the parking spot
      await tx.parkingSpot.delete({
        where: { id: spotId }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "Parking spot deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting parking spot:", error);
    return NextResponse.json({ error: "Failed to delete parking spot" }, { status: 500 });
  }
}
