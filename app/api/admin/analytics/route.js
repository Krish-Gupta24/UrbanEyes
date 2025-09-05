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

    // Get comprehensive analytics
    const [
      totalRevenue,
      totalBookings,
      activeBookings,
      totalSpots,
      recentBookings,
      topPerformingSpots,
      monthlyRevenue,
      averageBookingValue
    ] = await Promise.all([
      // Total revenue
      db.booking.aggregate({
        where: { 
          ownerId: userId,
          status: { in: ["ACTIVE", "COMPLETED"] }
        },
        _sum: { totalPrice: true }
      }),

      // Total bookings count
      db.booking.count({
        where: { ownerId: userId }
      }),

      // Active bookings count
      db.booking.count({
        where: { 
          ownerId: userId,
          status: "ACTIVE"
        }
      }),

      // Total spots count
      db.parkingSpot.count({
        where: { ownerId: userId }
      }),

      // Recent bookings (last 10)
      db.booking.findMany({
        where: { ownerId: userId },
        include: {
          parkingSpot: {
            select: {
              title: true,
              address: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),

      // Top performing spots
      db.parkingSpot.findMany({
        where: { ownerId: userId },
        include: {
          _count: {
            select: {
              bookings: {
                where: { status: { in: ["ACTIVE", "COMPLETED"] } }
              }
            }
          },
          bookings: {
            where: { status: { in: ["ACTIVE", "COMPLETED"] } },
            select: { totalPrice: true }
          }
        },
        orderBy: {
          bookings: {
            _count: "desc"
          }
        },
        take: 5
      }),

      // Monthly revenue (last 6 months)
      db.booking.groupBy({
        by: ['createdAt'],
        where: {
          ownerId: userId,
          status: { in: ["ACTIVE", "COMPLETED"] },
          createdAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // Last 6 months
          }
        },
        _sum: { totalPrice: true },
        _count: true
      }),

      // Average booking value
      db.booking.aggregate({
        where: { 
          ownerId: userId,
          status: { in: ["ACTIVE", "COMPLETED"] }
        },
        _avg: { totalPrice: true }
      })
    ]);

    // Calculate occupancy rate
    const occupancyRate = totalSpots > 0 ? Math.round((activeBookings / totalSpots) * 100) : 0;

    // Process top performing spots
    const processedTopSpots = topPerformingSpots.map(spot => ({
      id: spot.id,
      title: spot.title,
      address: spot.address,
      bookingCount: spot._count.bookings,
      totalRevenue: spot.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
    }));

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalBookings,
      activeBookings,
      totalSpots,
      occupancyRate,
      averageBookingValue: averageBookingValue._avg.totalPrice || 0,
      recentBookings,
      topPerformingSpots: processedTopSpots,
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item.createdAt.toISOString().substring(0, 7),
        revenue: item._sum.totalPrice || 0,
        bookings: item._count
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

