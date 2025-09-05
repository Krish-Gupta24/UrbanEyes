"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, MapPin, BarChart3, ArrowLeft, Plus, QrCode } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSpots: 0,
    activeBookings: 0,
    revenue: 0,
    occupancyRate: 0
  });
  const [bookings, setBookings] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (session.user?.role !== "OWNER") {
      router.push("/");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch recent bookings
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      }

      // Fetch parking spots
      const spotsRes = await fetch("/api/admin/parking-spots");
      if (spotsRes.ok) {
        const spotsData = await spotsRes.json();
        setParkingSpots(spotsData.parkingSpots || []);
      }

      // Fetch slips
      const slipsRes = await fetch("/api/admin/slips");
      if (slipsRes.ok) {
        const slipsData = await slipsRes.json();
        setSlips(slipsData.slips || []);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "OWNER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parking Management</h1>
            <p className="text-muted-foreground">Manage your parking business</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spots</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSpots}</div>
              <p className="text-xs text-muted-foreground">Parking spots listed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBookings}</div>
              <p className="text-xs text-muted-foreground">Currently booked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">Spot utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest parking spot reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No bookings yet</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.parkingSpot.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.customerName} • {booking.customerEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{booking.totalPrice.toFixed(2)}</p>
                        <p className={`text-sm ${
                          booking.status === "ACTIVE" ? "text-green-600" : 
                          booking.status === "COMPLETED" ? "text-blue-600" : 
                          "text-red-600"
                        }`}>
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your parking business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin/parking-spots">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parking Spot
                  </Button>
                </Link>
                <Link href="/admin/parking-spots">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Spots
                  </Button>
                </Link>
                <Link href="/admin/slips">
                  <Button className="w-full justify-start" variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    Slips
                  </Button>
                </Link>
                <Link href="/admin/slips">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Bookings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Parking Spots Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Parking Spots</CardTitle>
              <CardDescription>All your listed spots with availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parkingSpots.length === 0 ? (
                  <p className="text-muted-foreground">No spots yet</p>
                ) : (
                  parkingSpots.map((spot) => (
                    <div key={spot.id} className="p-4 border rounded-lg">
                      <p className="font-medium">{spot.title}</p>
                      <p className="text-sm text-muted-foreground">{spot.address}</p>
                      <p className="text-xs text-muted-foreground">Lat: {spot.latitude}, Lng: {spot.longitude}</p>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span>₹{spot.pricePerHour.toFixed(2)}/hr</span>
                        <span className="text-muted-foreground">Active: {spot._count?.bookings || 0}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Slips Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Slips</CardTitle>
              <CardDescription>Recent slips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slips.length === 0 ? (
                  <p className="text-muted-foreground">No slips yet</p>
                ) : (
                  slips.slice(0,6).map((slip) => (
                    <div key={slip.id} className="p-4 border rounded-lg">
                      <p className="font-medium">{slip.slipNumber}</p>
                      <p className="text-sm text-muted-foreground">{slip.booking?.parkingSpot?.title}</p>
                      <p className="text-xs text-muted-foreground">Status: {slip.status}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
