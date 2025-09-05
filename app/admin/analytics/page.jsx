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
    activeBookings: 0,
    totalSpots: 0,
    averageBookingValue: 0,
    occupancyRate: 0,
    topPerformingSpots: [],
    recentBookings: [],
    monthlyRevenue: []
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
      
      // Fetch comprehensive analytics
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        toast.error("Failed to load analytics");
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
            <h1 className="text-3xl font-bold text-foreground">Business Analytics</h1>
            <p className="text-muted-foreground">Track performance, optimize pricing, and grow your parking business</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Analytics Purpose */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Why Analytics Matter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-1">💰 Revenue Optimization</h4>
              <p>Track earnings patterns to optimize pricing and spot availability</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">📊 Performance Insights</h4>
              <p>Understand which spots perform best and identify growth opportunities</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">🎯 Business Growth</h4>
              <p>Make data-driven decisions to scale your parking business effectively</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(2)}</div>
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
              <div className="text-2xl font-bold">₹{analytics.averageBookingValue.toFixed(2)}</div>
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
          {/* Top Performing Spots */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Spots</CardTitle>
              <CardDescription>Your most profitable parking locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingSpots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No spots data available</p>
                ) : (
                  analytics.topPerformingSpots.map((spot, index) => (
                    <div key={spot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{spot.title}</p>
                          <p className="text-sm text-muted-foreground">{spot.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{spot.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{spot.bookingCount} bookings</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest customer activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent bookings</p>
                ) : (
                  analytics.recentBookings.map((booking, index) => (
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
                        <p className="font-medium">₹{booking.totalPrice.toFixed(2)}</p>
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
              <CardTitle>Business Insights & Recommendations</CardTitle>
              <CardDescription>Actionable insights to grow your parking business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {analytics.occupancyRate > 70 ? "Excellent" : 
                     analytics.occupancyRate > 40 ? "Good" : "Needs Improvement"}
                  </div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate: {analytics.occupancyRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.occupancyRate > 70 ? "Great utilization!" : 
                     analytics.occupancyRate > 40 ? "Room for improvement" : "Consider lowering prices"}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    ₹{analytics.averageBookingValue.toFixed(0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Booking Value</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.averageBookingValue > 50 ? "Premium pricing working" : "Consider value optimization"}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.totalSpots}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Spots</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.totalSpots < 5 ? "Consider adding more spots" : "Good spot diversity"}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {analytics.activeBookings}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.activeBookings > 0 ? "Business is active" : "Focus on marketing"}
                  </p>
                </div>
              </div>
              
              {/* Business Recommendations */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 Business Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Pricing Strategy</h5>
                    <p className="text-blue-700 dark:text-blue-300">
                      {analytics.occupancyRate > 70 ? "Consider increasing prices for high-demand spots" : 
                       analytics.occupancyRate < 30 ? "Lower prices to attract more customers" : 
                       "Current pricing seems balanced"}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Growth Opportunities</h5>
                    <p className="text-blue-700 dark:text-blue-300">
                      {analytics.totalSpots < 3 ? "Add more parking spots to increase revenue potential" :
                       "Focus on optimizing existing spots and customer retention"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
