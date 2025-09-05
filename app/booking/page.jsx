"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Car, Calendar, CheckCircle, AlertCircle, Users, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    carNumber: ""
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Online/offline detection with connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('connected');
      // Refresh data when coming back online
      if (!loading && !refreshing) {
        fetchSpots(true);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loading, refreshing, fetchSpots]);

  // Initial data fetch
  useEffect(() => {
    fetchSpots();
  }, []);

  // Auto-refresh every 15 seconds for better real-time experience
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && !loading && !refreshing) {
        fetchSpots(true); // Silent refresh
      }
    }, 15000); // Reduced from 30s to 15s for better real-time updates

    return () => clearInterval(interval);
  }, [isOnline, loading, refreshing]);

  // Additional refresh on window focus for better UX
  useEffect(() => {
    const handleFocus = () => {
      if (isOnline && !loading && !refreshing) {
        fetchSpots(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isOnline, loading, refreshing, fetchSpots]);

  const fetchSpots = useCallback(async (silent = false) => {
    if (!isOnline) {
      setError("You're offline. Please check your internet connection.");
      setConnectionStatus('disconnected');
      return;
    }

    try {
      if (!silent) {
        setRefreshing(true);
        setError(null);
      }
      
      setConnectionStatus('connecting');
      
      const res = await fetch("/api/parking-spots", {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSpots(data.spots || []);
        setLastUpdated(new Date());
        setError(null);
        setConnectionStatus('connected');
        
        if (!silent) {
          toast.success("Parking spots updated");
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch parking spots');
      }
    } catch (error) {
      console.error("Error fetching spots:", error);
      setError(error.message);
      setConnectionStatus('error');
      if (!silent) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  const handleBooking = async () => {
    if (!selectedSpot) {
      toast.error("Please select a parking spot");
      return;
    }

    if (!bookingData.startTime || !bookingData.endTime || !bookingData.customerName || !bookingData.customerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isOnline) {
      toast.error("You're offline. Please check your internet connection.");
      return;
    }

    // Check if spot is still available
    const currentSpot = spots.find(s => s.id === selectedSpot.id);
    if (!currentSpot || currentSpot.totalSpots <= currentSpot.occupiedSpots) {
      toast.error("This parking spot is no longer available. Please select another spot.");
      setSelectedSpot(null);
      fetchSpots(); // Refresh data
      return;
    }

    // Set booking state
    setIsBooking(true);
    setConnectionStatus('connecting');

    // Optimistic update - immediately update UI to show booking in progress
    const originalSpots = [...spots];
    setSpots(prevSpots => 
      prevSpots.map(spot => 
        spot.id === selectedSpot.id 
          ? { ...spot, occupiedSpots: spot.occupiedSpots + 1 }
          : spot
      )
    );

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({
          ...bookingData,
          parkingSpotId: selectedSpot.id,
          startTime: new Date(bookingData.startTime).toISOString(),
          endTime: new Date(bookingData.endTime).toISOString()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBookingId(data.booking.id);
        setBookingSuccess(true);
        setConnectionStatus('connected');
        toast.success("Booking created successfully!");
        
        // Refresh spots data after successful booking to ensure accuracy
        setTimeout(() => {
          fetchSpots(true);
        }, 1000);
      } else {
        // Revert optimistic update on failure
        setSpots(originalSpots);
        setConnectionStatus('error');
        
        const error = await res.json();
        let errorMessage = error.error || "Failed to create booking";
        
        // Provide more specific error messages
        if (error.error?.includes("not available") || error.error?.includes("occupied")) {
          errorMessage = "This spot is no longer available. Please select another spot.";
          setSelectedSpot(null);
        } else if (error.error?.includes("validation")) {
          errorMessage = "Please check your booking details and try again.";
        }
        
        toast.error(errorMessage);
        
        // Refresh data to get latest availability
        fetchSpots(true);
      }
    } catch (error) {
      // Revert optimistic update on network error
      setSpots(originalSpots);
      setConnectionStatus('error');
      
      console.error("Booking error:", error);
      toast.error("Network error. Please check your connection and try again.");
      
      // Refresh data to get latest state
      fetchSpots(true);
    } finally {
      setIsBooking(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedSpot || !bookingData.startTime || !bookingData.endTime) return 0;
    
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    
    return hours * selectedSpot.pricePerHour;
  };

  const getAvailabilityStatus = (spot) => {
    const available = spot.totalSpots - spot.occupiedSpots;
    if (available === 0) return { text: "Full", color: "text-red-600", bg: "bg-red-50" };
    if (available <= 2) return { text: "Low", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Available", color: "text-green-600", bg: "bg-green-50" };
  };

  const isBookingValid = () => {
    if (!selectedSpot || !bookingData.startTime || !bookingData.endTime) return false;
    
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const now = new Date();
    
    return start > now && end > start;
  };

  const resetBooking = () => {
    setBookingSuccess(false);
    setBookingId(null);
    setSelectedSpot(null);
    setBookingData({
      startTime: "",
      endTime: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      carNumber: ""
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Parking Spots</h2>
          <p className="text-muted-foreground">Fetching real-time availability...</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-4">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your parking spot has been successfully booked.
            </p>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-medium">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{selectedSpot?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {new Date(bookingData.startTime).toLocaleDateString()} - {new Date(bookingData.endTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Price:</span>
                  <span className="font-bold text-lg">₹{calculatePrice().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-x-4">
              <Button onClick={resetBooking} variant="outline">
                Book Another Spot
              </Button>
              <Button onClick={() => router.push("/")}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Book Parking Spot</h1>
          <div className="flex items-center space-x-4">
            {/* Enhanced Connection Status */}
            <div className="flex items-center space-x-2 text-sm">
              {connectionStatus === 'connected' ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span>Live Data</span>
                </div>
              ) : connectionStatus === 'connecting' ? (
                <div className="flex items-center text-blue-600">
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : connectionStatus === 'error' ? (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span>Connection Error</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span>Offline</span>
                </div>
              )}
            </div>
            
            {/* Refresh Button */}
            <Button
              onClick={() => fetchSpots()}
              disabled={refreshing || !isOnline}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <Button
              onClick={() => fetchSpots()}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        )}

        {lastUpdated && (
          <div className="mb-4 text-sm text-muted-foreground text-center flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            {refreshing && (
              <RefreshCw className="h-3 w-3 ml-2 animate-spin text-primary" />
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Spots */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Parking Spots</h2>
            <div className="space-y-4">
              {spots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No parking spots available</p>
              ) : (
                spots.map((spot) => {
                  const availability = getAvailabilityStatus(spot);
                  const isAvailable = spot.totalSpots > spot.occupiedSpots;
                  
                  return (
                    <Card 
                      key={spot.id} 
                      className={`cursor-pointer transition-all ${
                        selectedSpot?.id === spot.id ? 'ring-2 ring-primary' : 
                        !isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                      onClick={() => isAvailable && setSelectedSpot(spot)}
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            {spot.totalSpots - spot.occupiedSpots} of {spot.totalSpots} available
                            {refreshing && (
                              <RefreshCw className="h-3 w-3 ml-2 animate-spin text-primary" />
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${availability.bg} ${availability.color}`}>
                            {availability.text}
                          </div>
                        </div>
                        
                        {/* Real-time availability bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              availability.text === "Full" ? "bg-red-500" :
                              availability.text === "Low" ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ 
                              width: `${(spot.occupiedSpots / spot.totalSpots) * 100}%` 
                            }}
                          ></div>
                        </div>
                        {!isAvailable && (
                          <div className="flex items-center text-sm text-red-600 mt-2">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Fully booked
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
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

                  <div>
                    <Label htmlFor="carNumber">Car Number Plate (Optional)</Label>
                    <Input
                      id="carNumber"
                      value={bookingData.carNumber}
                      onChange={(e) => setBookingData({ ...bookingData, carNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g., DL01AB1234"
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-xl font-bold text-primary">₹{calculatePrice().toFixed(2)}</span>
                    </div>
                    {refreshing && (
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Updating availability...
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleBooking} 
                    className="w-full"
                    disabled={!isBookingValid() || !bookingData.customerName || !bookingData.customerEmail || refreshing || !isOnline || isBooking}
                  >
                    {isBooking ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing Booking...
                      </>
                    ) : refreshing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating Availability...
                      </>
                    ) : !isOnline ? (
                      <>
                        <WifiOff className="h-4 w-4 mr-2" />
                        Offline
                      </>
                    ) : connectionStatus === 'error' ? (
                      <>
                        <WifiOff className="h-4 w-4 mr-2" />
                        Connection Error
                      </>
                    ) : (
                      "Book Now"
                    )}
                  </Button>
                  
                  {!isBookingValid() && bookingData.startTime && bookingData.endTime && (
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Please select valid start and end times
                    </div>
                  )}
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

