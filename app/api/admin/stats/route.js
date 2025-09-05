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

    // Get parking spots count
    const totalSpots = await db.parkingSpot.count({
      where: { ownerId: userId }
    });

    // Get active bookings count
    const activeBookings = await db.booking.count({
      where: { 
        ownerId: userId,
        status: "ACTIVE"
      }
    });

    // Get total revenue from bookings
    const bookingRevenueResult = await db.booking.aggregate({
      where: { 
        ownerId: userId,
        status: { in: ["ACTIVE", "COMPLETED"] }
      },
      _sum: { totalPrice: true }
    });

    // Get total revenue from completed slips
    const slipRevenueResult = await db.parkingSlip.aggregate({
      where: { 
        ownerId: userId,
        status: "COMPLETED",
        revenue: { not: null }
      },
      _sum: { revenue: true }
    });

    const totalRevenue = (bookingRevenueResult._sum.totalPrice || 0) + (slipRevenueResult._sum.revenue || 0);

    // Get occupancy rate based on actual spot capacity
    const totalCapacity = await db.parkingSpot.aggregate({
      where: { ownerId: userId },
      _sum: { totalSpots: true }
    });

    const totalOccupied = await db.parkingSpot.aggregate({
      where: { ownerId: userId },
      _sum: { occupiedSpots: true }
    });

    const occupancyRate = totalCapacity._sum.totalSpots > 0 ? 
      Math.round((totalOccupied._sum.occupiedSpots / totalCapacity._sum.totalSpots) * 100) : 0;

    return NextResponse.json({
      totalSpots,
      activeBookings,
      revenue: totalRevenue,
      occupancyRate
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
