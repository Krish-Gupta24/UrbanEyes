"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, MapPin, BarChart3, ArrowLeft, Plus, QrCode, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
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
  const [quickActions, setQuickActions] = useState({
    generatingSlip: false,
    addingSpot: false
  });

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

  const quickGenerateSlip = async (spotId) => {
    try {
      setQuickActions(prev => ({ ...prev, generatingSlip: true }));
      const res = await fetch("/api/admin/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          parkingSpotId: spotId,
          validHours: 12
        })
      });

      if (res.ok) {
        toast.success("Quick slip generated successfully!");
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to generate slip");
      }
    } catch (error) {
      toast.error("Failed to generate slip");
    } finally {
      setQuickActions(prev => ({ ...prev, generatingSlip: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getAvailabilityStatus = (spot) => {
    const available = spot.totalSpots - spot.occupiedSpots;
    if (available === 0) return { text: "Full", color: "text-red-600", bg: "bg-red-50" };
    if (available <= 2) return { text: "Low", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Available", color: "text-green-600", bg: "bg-green-50" };
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
              <div className="text-2xl font-bold">{parkingSpots.reduce((sum, spot) => sum + spot.totalSpots, 0)}</div>
              <p className="text-xs text-muted-foreground">
                {parkingSpots.length} locations • {parkingSpots.reduce((sum, spot) => sum + (spot.totalSpots - spot.occupiedSpots), 0)} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === "ACTIVE").length}</div>
              <p className="text-xs text-muted-foreground">
                {bookings.length} total • {slips.filter(s => s.status === "ACTIVE").length} active slips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(
                bookings.reduce((sum, booking) => sum + booking.totalPrice, 0) + 
                slips.filter(s => s.status === "COMPLETED" && s.revenue).reduce((sum, slip) => sum + slip.revenue, 0)
              ).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {bookings.length} bookings + {slips.filter(s => s.status === "COMPLETED").length} completed slips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parkingSpots.length > 0 ? 
                  Math.round((parkingSpots.reduce((sum, spot) => sum + spot.occupiedSpots, 0) / 
                  parkingSpots.reduce((sum, spot) => sum + spot.totalSpots, 0)) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {parkingSpots.reduce((sum, spot) => sum + spot.occupiedSpots, 0)}/{parkingSpots.reduce((sum, spot) => sum + spot.totalSpots, 0)} occupied
              </p>
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
                  bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <p className="font-medium">{booking.parkingSpot.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.customerName} • {booking.customerEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                          </p>
                        </div>
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
                    Generate Slips
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Quick Slip Generation</p>
                  {parkingSpots.filter(spot => spot.totalSpots > spot.occupiedSpots).slice(0, 3).map((spot) => (
                    <Button
                      key={spot.id}
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs"
                      onClick={() => quickGenerateSlip(spot.id)}
                      disabled={quickActions.generatingSlip}
                    >
                      <QrCode className="h-3 w-3 mr-2" />
                      {spot.title} ({spot.totalSpots - spot.occupiedSpots} available)
                    </Button>
                  ))}
                </div>
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
                  parkingSpots.map((spot) => {
                    const availability = getAvailabilityStatus(spot);
                    return (
                      <div key={spot.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{spot.title}</p>
                            <p className="text-sm text-muted-foreground">{spot.address}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${availability.bg} ${availability.color}`}>
                            {availability.text}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>₹{spot.pricePerHour.toFixed(2)}/hr</span>
                            <span className="text-muted-foreground">
                              {spot.occupiedSpots}/{spot.totalSpots} occupied
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                availability.text === "Full" ? "bg-red-500" :
                                availability.text === "Low" ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ 
                                width: `${(spot.occupiedSpots / spot.totalSpots) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
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
                    <div key={slip.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{slip.slipNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {slip.booking?.parkingSpot?.title || slip.parkingSpot?.title}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slip.status === "ACTIVE" ? "bg-green-50 text-green-600" :
                          slip.status === "EXPIRED" ? "bg-red-50 text-red-600" :
                          "bg-gray-50 text-gray-600"
                        }`}>
                          {slip.status}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Valid until: {new Date(slip.validUntil).toLocaleDateString()}
                      </div>
                      {slip.booking && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Customer: {slip.booking.customerName}
                        </div>
                      )}
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
