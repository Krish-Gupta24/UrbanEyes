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

    // Get total revenue
    const revenueResult = await db.booking.aggregate({
      where: { 
        ownerId: userId,
        status: { in: ["ACTIVE", "COMPLETED"] }
      },
      _sum: { totalPrice: true }
    });

    // Get occupancy rate
    const totalBookings = await db.booking.count({
      where: { 
        ownerId: userId,
        status: { in: ["ACTIVE", "COMPLETED"] }
      }
    });

    const occupancyRate = totalSpots > 0 ? Math.round((totalBookings / totalSpots) * 100) : 0;

    return NextResponse.json({
      totalSpots,
      activeBookings,
      revenue: revenueResult._sum.totalPrice || 0,
      occupancyRate
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
