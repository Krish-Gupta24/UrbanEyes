"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Car, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
    customerName: "",
    customerEmail: "",
    customerPhone: ""
  });

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const res = await fetch("/api/parking-spots");
      if (res.ok) {
        const data = await res.json();
        setSpots(data.spots);
      }
    } catch (error) {
      toast.error("Failed to load parking spots");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSpot) {
      toast.error("Please select a parking spot");
      return;
    }

    if (!bookingData.startTime || !bookingData.endTime || !bookingData.customerName || !bookingData.customerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          parkingSpotId: selectedSpot.id,
          startTime: new Date(bookingData.startTime).toISOString(),
          endTime: new Date(bookingData.endTime).toISOString()
        })
      });

      if (res.ok) {
        toast.success("Booking created successfully!");
        router.push("/");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create booking");
      }
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };

  const calculatePrice = () => {
    if (!selectedSpot || !bookingData.startTime || !bookingData.endTime) return 0;
    
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    
    return hours * selectedSpot.pricePerHour;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Book Parking Spot</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Spots */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Parking Spots</h2>
            <div className="space-y-4">
              {spots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No parking spots available</p>
              ) : (
                spots.map((spot) => (
                  <Card 
                    key={spot.id} 
                    className={`cursor-pointer transition-all ${
                      selectedSpot?.id === spot.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {spot.title}
                        <span className="text-lg font-bold text-primary">₹{spot.pricePerHour}/hr</span>
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {spot.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {spot.description && (
                        <p className="text-sm text-muted-foreground mb-2">{spot.description}</p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Car className="h-4 w-4 mr-1" />
                        Available
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            {selectedSpot ? (
              <Card>
                <CardHeader>
                  <CardTitle>Book: {selectedSpot.title}</CardTitle>
                  <CardDescription>{selectedSpot.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customerName">Your Name</Label>
                    <Input
                      id="customerName"
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={bookingData.customerEmail}
                      onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone (Optional)</Label>
                    <Input
                      id="customerPhone"
                      value={bookingData.customerPhone}
                      onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-xl font-bold text-primary">₹{calculatePrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button onClick={handleBooking} className="w-full">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a parking spot to book</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
