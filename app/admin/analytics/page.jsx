"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    occupancyRate: 0,
    topSpots: [],
    recentActivity: []
  });
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

    fetchAnalytics();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAnalytics(prev => ({
          ...prev,
          totalRevenue: statsData.revenue,
          totalBookings: statsData.activeBookings,
          occupancyRate: statsData.occupancyRate
        }));
      }

      // Fetch bookings for analytics
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookings = bookingsData.bookings;
        
        // Calculate average booking value
        const totalValue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        const avgValue = bookings.length > 0 ? totalValue / bookings.length : 0;
        
        setAnalytics(prev => ({
          ...prev,
          averageBookingValue: avgValue,
          recentActivity: bookings.slice(0, 5)
        }));
      }

    } catch (error) {
      toast.error("Failed to load analytics");
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
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Track your parking business performance</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookings}</div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averageBookingValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">Spot utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest booking activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  analytics.recentActivity.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.parkingSpot.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                        <Badge variant={booking.status === "ACTIVE" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key insights about your parking business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {analytics.occupancyRate > 70 ? "Excellent" : 
                     analytics.occupancyRate > 40 ? "Good" : "Needs Improvement"}
                  </div>
                  <p className="text-sm text-muted-foreground">Occupancy Performance</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    ${analytics.averageBookingValue.toFixed(0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Booking Value</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.totalBookings > 0 ? "Active" : "Inactive"}
                  </div>
                  <p className="text-sm text-muted-foreground">Business Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
