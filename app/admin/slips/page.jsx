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
import { QrCode, Download, Eye, ArrowLeft, Filter, Search, Plus, Trash2, Clock, MapPin, Users, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SlipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slips, setSlips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showManualSlipDialog, setShowManualSlipDialog] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState("");
  const [validHours, setValidHours] = useState(12);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedSlipForCompletion, setSelectedSlipForCompletion] = useState(null);
  const [customRevenue, setCustomRevenue] = useState("");
  const [carNumber, setCarNumber] = useState("");

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
  }, [session, status]);

  const fetchData = async () => {
    try {
      console.log("Fetching data...");
      setLoading(true);
      
      // Fetch slips
      const slipsRes = await fetch("/api/admin/slips");
      if (slipsRes.ok) {
        const slipsData = await slipsRes.json();
        console.log("Slips fetched:", slipsData.slips?.length || 0);
        setSlips(slipsData.slips || []);
      } else {
        console.error("Failed to fetch slips:", slipsRes.status);
      }

      // Fetch bookings for slip generation
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        console.log("Bookings fetched:", bookingsData.bookings?.length || 0);
        setBookings(bookingsData.bookings || []);
      } else {
        console.error("Failed to fetch bookings:", bookingsRes.status);
      }

      // Fetch parking spots for manual slip generation
      const spotsRes = await fetch("/api/admin/parking-spots");
      if (spotsRes.ok) {
        const spotsData = await spotsRes.json();
        console.log("Parking spots fetched:", spotsData.parkingSpots?.length || 0);
        setParkingSpots(spotsData.parkingSpots || []);
      } else {
        console.error("Failed to fetch parking spots:", spotsRes.status);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateSlip = async (bookingId, carNumber = "") => {
    try {
      console.log("Generating slip for booking:", bookingId, "carNumber:", carNumber);
      const res = await fetch("/api/admin/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, carNumber })
      });

      console.log("Slip generation response:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Slip generated successfully:", data);
        toast.success("Slip generated successfully");
        fetchData();
      } else {
        const error = await res.json();
        console.error("Slip generation error:", error);
        toast.error(error.error || "Failed to generate slip");
      }
    } catch (error) {
      console.error("Slip generation catch error:", error);
      toast.error("Failed to generate slip");
    }
  };

  const generateManualSlip = async () => {
    if (!selectedSpot) {
      toast.error("Please select a parking spot");
      return;
    }

    try {
      console.log("Generating manual slip for spot:", selectedSpot, "validHours:", validHours);
      const res = await fetch("/api/admin/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          parkingSpotId: selectedSpot,
          validHours: validHours,
          carNumber: carNumber
        })
      });

      console.log("Manual slip generation response:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Manual slip generated successfully:", data);
        toast.success("Manual slip generated successfully");
        setShowManualSlipDialog(false);
        setSelectedSpot("");
        setValidHours(12);
        setCarNumber("");
        fetchData();
      } else {
        const error = await res.json();
        console.error("Manual slip generation error:", error);
        toast.error(error.error || "Failed to generate slip");
      }
    } catch (error) {
      console.error("Manual slip generation catch error:", error);
      toast.error("Failed to generate slip");
    }
  };

  const deleteSlip = async (slipId) => {
    if (!confirm("Are you sure you want to delete this slip? This will free up the parking slot.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/slips/${slipId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("Slip deleted successfully");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete slip");
      }
    } catch (error) {
      toast.error("Failed to delete slip");
    }
  };

  const completeSlip = async (slipId, customRevenueAmount = null) => {
    try {
      console.log("Completing slip:", slipId, "with revenue:", customRevenueAmount);
      const res = await fetch(`/api/admin/slips/${slipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "complete",
          revenue: customRevenueAmount ? parseFloat(customRevenueAmount) : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Slip completed successfully:", data);
        toast.success(`Slip completed! Revenue: ₹${data.revenue.toFixed(2)}`);
        setShowCompletionDialog(false);
        setSelectedSlipForCompletion(null);
        setCustomRevenue("");
        fetchData();
      } else {
        const error = await res.json();
        console.error("Slip completion error:", error);
        toast.error(error.error || "Failed to complete slip");
      }
    } catch (error) {
      console.error("Slip completion catch error:", error);
      toast.error("Failed to complete slip");
    }
  };

  const openCompletionDialog = (slip) => {
    setSelectedSlipForCompletion(slip);
    setShowCompletionDialog(true);
  };

  const downloadSlip = (slip) => {
    const link = document.createElement("a");
    link.href = slip.qrCode;
    link.download = `parking-slip-${slip.slipNumber}.png`;
    link.click();
  };

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to clear ALL data? This will delete all slips, reset all parking spot occupancy to 0, and cannot be undone!")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/slips/clear", {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("All data cleared successfully");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to clear data");
      }
    } catch (error) {
      toast.error("Failed to clear data");
    }
  };

  const filteredSlips = slips.filter(slip => {
    const matchesFilter = filter === "ALL" || slip.status === filter;
    const matchesSearch = slip.slipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (slip.booking?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         slip.parkingSpot.title.toLowerCase().includes(searchTerm.toLowerCase());
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
              <span>From Booking</span>
            </Button>
            <Button 
              onClick={() => setShowManualSlipDialog(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Manual Slip</span>
            </Button>
            <Button 
              onClick={clearAllData}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Data</span>
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slips</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slips.length}</div>
              <p className="text-xs text-muted-foreground">
                {slips.filter(s => s.status === "ACTIVE").length} active • {slips.filter(s => s.status === "COMPLETED").length} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spots</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parkingSpots.reduce((sum, spot) => sum + spot.totalSpots, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {parkingSpots.reduce((sum, spot) => sum + spot.occupiedSpots, 0)} occupied
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {parkingSpots.reduce((sum, spot) => sum + (spot.totalSpots - spot.occupiedSpots), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for new slips
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slip Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{slips.filter(s => s.status === "COMPLETED" && s.revenue).reduce((sum, slip) => sum + slip.revenue, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {slips.filter(s => s.status === "COMPLETED").length} completed slips
              </p>
            </CardContent>
          </Card>
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
              <SelectItem value="COMPLETED">Completed</SelectItem>
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
                    {slip.parkingSpot.title}
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

                  {/* Slip Details */}
                  <div className="space-y-2 text-sm">
                    {slip.booking ? (
                      <>
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
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">Manual Slip</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span className="font-medium">
                        {new Date(slip.validUntil).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(slip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {slip.carNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Car Number:</span>
                        <span className="font-medium font-mono">{slip.carNumber}</span>
                      </div>
                    )}
                    {slip.status === "COMPLETED" && slip.revenue && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-bold text-green-600">₹{slip.revenue.toFixed(2)}</span>
                      </div>
                    )}
                    {slip.status === "COMPLETED" && slip.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium">
                          {new Date(slip.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {slip.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        onClick={() => openCompletionDialog(slip)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
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
                      variant="destructive"
                      onClick={() => deleteSlip(slip.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
              <DialogTitle>Generate Parking Slip from Booking</DialogTitle>
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
                    <div key={booking.id} className="p-3 border rounded-lg space-y-3">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.parkingSpot.title} • ₹{booking.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`car-number-${booking.id}`} className="text-xs">Car Number (Optional)</Label>
                        <Input
                          id={`car-number-${booking.id}`}
                          type="text"
                          placeholder="e.g., DL01AB1234"
                          onChange={(e) => {
                            // Store car number in a temporary way
                            booking._tempCarNumber = e.target.value.toUpperCase();
                          }}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          generateSlip(booking.id, booking._tempCarNumber || "");
                          setShowBookingDialog(false);
                        }}
                        disabled={booking.slip} // Disable if slip already exists
                        className="w-full"
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

        {/* Manual Slip Generation Dialog */}
        <Dialog open={showManualSlipDialog} onOpenChange={setShowManualSlipDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Manual Parking Slip</DialogTitle>
              <DialogDescription>
                Create a parking slip for a specific spot without a booking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spot-select">Select Parking Spot</Label>
                <Select value={selectedSpot} onValueChange={setSelectedSpot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a parking spot" />
                  </SelectTrigger>
                  <SelectContent>
                    {parkingSpots.map((spot) => (
                      <SelectItem 
                        key={spot.id} 
                        value={spot.id}
                        disabled={spot.occupiedSpots >= spot.totalSpots}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{spot.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {spot.occupiedSpots}/{spot.totalSpots} occupied
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valid-hours">Valid for (hours)</Label>
                <Input
                  id="valid-hours"
                  type="number"
                  min="1"
                  max="24"
                  value={validHours}
                  onChange={(e) => setValidHours(parseInt(e.target.value) || 12)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car-number">Car Number Plate (Optional)</Label>
                <Input
                  id="car-number"
                  type="text"
                  value={carNumber}
                  onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., DL01AB1234"
                />
              </div>

              {selectedSpot && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This will occupy 1 spot at the selected location for {validHours} hours.
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={generateManualSlip}
                  disabled={!selectedSpot}
                  className="flex-1"
                >
                  Generate Slip
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowManualSlipDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Slip Completion Dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Parking Slip</DialogTitle>
              <DialogDescription>
                Mark this slip as completed and add revenue to your account.
              </DialogDescription>
            </DialogHeader>
            {selectedSlipForCompletion && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Slip Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slip Number:</span>
                      <span className="font-medium">{selectedSlipForCompletion.slipNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedSlipForCompletion.parkingSpot.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedSlipForCompletion.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedSlipForCompletion.carNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Car Number:</span>
                        <span className="font-medium font-mono">{selectedSlipForCompletion.carNumber}</span>
                      </div>
                    )}
                    {selectedSlipForCompletion.booking && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{selectedSlipForCompletion.booking.customerName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-revenue">Custom Revenue (Optional)</Label>
                  <Input
                    id="custom-revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={customRevenue}
                    onChange={(e) => setCustomRevenue(e.target.value)}
                    placeholder="Leave empty for automatic calculation"
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedSlipForCompletion.booking 
                      ? `Booking price: ₹${selectedSlipForCompletion.booking.totalPrice.toFixed(2)}`
                      : `Spot rate: ₹${selectedSlipForCompletion.parkingSpot.pricePerHour}/hour`
                    }
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => completeSlip(selectedSlipForCompletion.id, customRevenue)}
                    className="flex-1"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Complete & Add Revenue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCompletionDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
