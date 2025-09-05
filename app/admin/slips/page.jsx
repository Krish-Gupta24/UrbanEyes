"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Download, Eye, ArrowLeft, Filter, Search, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SlipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slips, setSlips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);

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

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch slips
      const slipsRes = await fetch("/api/admin/slips");
      if (slipsRes.ok) {
        const slipsData = await slipsRes.json();
        setSlips(slipsData.slips);
      }

      // Fetch bookings for slip generation
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateSlip = async (bookingId) => {
    try {
      const res = await fetch("/api/admin/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId })
      });

      if (res.ok) {
        toast.success("Slip generated successfully");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to generate slip");
      }
    } catch (error) {
      toast.error("Failed to generate slip");
    }
  };

  const downloadSlip = (slip) => {
    const link = document.createElement("a");
    link.href = slip.qrCode;
    link.download = `parking-slip-${slip.slipNumber}.png`;
    link.click();
  };

  const filteredSlips = slips.filter(slip => {
    const matchesFilter = filter === "ALL" || slip.status === filter;
    const matchesSearch = slip.slipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slip.booking.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <h1 className="text-3xl font-bold text-foreground">Parking Slips</h1>
            <p className="text-muted-foreground">Generate and manage parking slips</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowBookingDialog(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Slip</span>
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search slips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Slips</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="USED">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Slips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlips.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No slips found</h3>
              <p className="text-muted-foreground">Generate slips for your bookings to get started</p>
            </div>
          ) : (
            filteredSlips.map((slip) => (
              <Card key={slip.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{slip.slipNumber}</CardTitle>
                    <Badge 
                      variant={slip.status === "ACTIVE" ? "default" : 
                              slip.status === "EXPIRED" ? "destructive" : "secondary"}
                    >
                      {slip.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {slip.booking.parkingSpot.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                      <Image
                        src={slip.qrCode}
                        alt="QR Code"
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{slip.booking.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {new Date(slip.booking.startTime).toLocaleDateString()} - {new Date(slip.booking.endTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">₹{slip.booking.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span className="font-medium">
                        {new Date(slip.validUntil).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadSlip(slip)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(slip.qrCode, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Slip Generation Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Parking Slip</DialogTitle>
              <DialogDescription>
                Select a booking to generate a parking slip with QR code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No bookings available for slip generation</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.parkingSpot.title} • ₹{booking.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          generateSlip(booking.id);
                          setShowBookingDialog(false);
                        }}
                        disabled={booking.slip} // Disable if slip already exists
                      >
                        {booking.slip ? "Slip Exists" : "Generate Slip"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
