"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainNavigation } from "@/components/navigation"
import { MapPin, Search, Filter, DollarSign, Clock, Star, Navigation, Phone, Zap, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"


export default function ParkingPage() {
  const [searchLocation, setSearchLocation] = useState("Taj Mahal, Agra")
  const [radiusFilter, setRadiusFilter] = useState("2")
  const [priceFilter, setPriceFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [parkingSpots, setParkingSpots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deletingSpot, setDeletingSpot] = useState(null)

  const fetchParkingData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First, geocode the search location to get coordinates
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchLocation
        )}&limit=1`
      )
      const geocodeData = await geocodeResponse.json()

      if (!geocodeData || geocodeData.length === 0) {
        throw new Error("Location not found")
      }

      const coords = {
        lat: parseFloat(geocodeData[0].lat),
        lng: parseFloat(geocodeData[0].lon)
      }

      // Then fetch nearby parking spots
      const response = await fetch(
        `/api/parking-spots/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=${radiusFilter}`
      )

      if (response.ok) {
        const data = await response.json()
        setParkingSpots(data.spots || [])
      } else {
        throw new Error("Failed to fetch parking spots")
      }
    } catch (err) {
      setError(err.message || "Network error occurred")
      console.error("Parking API error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchParkingData()
  }, [searchLocation, radiusFilter, availabilityFilter])

  const handleSearch = () => {
    fetchParkingData()
  }

  const handleDeleteSpot = async (spotId) => {
    if (!confirm("Are you sure you want to delete this parking spot? This action cannot be undone.")) {
      return;
    }

    setDeletingSpot(spotId);
    try {
      const response = await fetch(`/api/parking-spots/delete?id=${spotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove the spot from the local state
        setParkingSpots(prev => prev.filter(spot => spot.id !== spotId));
        alert("Parking spot deleted successfully");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete parking spot: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error deleting parking spot:", err);
      alert("Network error occurred while deleting parking spot");
    } finally {
      setDeletingSpot(null);
    }
  }

  const getAvailabilityColor = (availableSpots, totalSpots) => {
    const availability = availableSpots > 0 ? (availableSpots <= 2 ? "limited" : "available") : "full"
    switch (availability) {
      case "available":
        return "text-green-600 bg-green-50 border-green-200"
      case "limited":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "full":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getAvailabilityText = (availableSpots, totalSpots) => {
    if (availableSpots === 0) return "full"
    if (availableSpots <= 2) return "limited"
    return "available"
  }

  const filteredSpots = parkingSpots.filter((spot) => {
    const availability = getAvailabilityText(spot.availableSpots, spot.totalSpots)
    if (availabilityFilter !== "all" && availability !== availabilityFilter) return false
    if (priceFilter !== "all") {
      const price = spot.pricePerHour
      if (priceFilter === "budget" && price > 35) return false
      if (priceFilter === "premium" && price <= 35) return false
    }
    const distance = spot.distance
    const maxRadius = Number.parseInt(radiusFilter)
    if (distance > maxRadius) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-4">Find Perfect Parking</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Discover available parking spots with real-time updates and instant booking
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search location or landmark"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="bg-background"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km radius</SelectItem>
                  <SelectItem value="2">2 km radius</SelectItem>
                  <SelectItem value="5">5 km radius</SelectItem>
                  <SelectItem value="10">10 km radius</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search Parking"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-40 bg-background">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spots</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40 bg-background">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget (&#8804;₹35)</SelectItem>
                  <SelectItem value="premium">Premium (&#8805;₹35)</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="px-3 py-1">
                <Filter className="h-3 w-3 mr-1" />
                {filteredSpots.length} spots found
              </Badge>

              <Badge variant="outline" className="px-3 py-1 text-blue-600">
                <Zap className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}
          </CardContent>
        </Card>

        {isLoading && parkingSpots.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading parking spots...</p>
          </div>
        ) : (
          <>
            {/* Parking Spots Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSpots.map((spot) => {
                const availability = getAvailabilityText(spot.availableSpots, spot.totalSpots)
                return (
                  <Card
                    key={spot.id}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{spot.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {spot.distance.toFixed(2)} km away
                          </CardDescription>
                        </div>
                        <Badge className={`${getAvailabilityColor(spot.availableSpots, spot.totalSpots)} border`}>
                          {availability}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="h-4 w-4" />
                          ₹{spot.pricePerHour}/hr
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{spot.address}</p>
                      
                      {spot.description && (
                        <p className="text-sm text-muted-foreground">{spot.description}</p>
                      )}

                      {/* Availability Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Availability</span>
                          <span className="font-medium">
                            {spot.availableSpots}/{spot.totalSpots} spots
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              availability === "available"
                                ? "bg-green-500"
                                : availability === "limited"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${(spot.availableSpots / spot.totalSpots) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1" 
                          disabled={availability === "full"}
                          onClick={() => window.open('/booking', '_blank')}
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          {availability === "full" ? "Full" : "Book Now"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={availability === "full"}
                          onClick={() => window.open('/route', '_blank')}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={deletingSpot === spot.id}
                          onClick={() => handleDeleteSpot(spot.id)}
                        >
                          {deletingSpot === spot.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4 border-0 bg-card/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary mb-1">
                  {filteredSpots.filter((s) => getAvailabilityText(s.availableSpots, s.totalSpots) === "available").length}
                </div>
                <div className="text-sm text-muted-foreground">Available Now</div>
              </Card>

              <Card className="text-center p-4 border-0 bg-card/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-accent mb-1">
                  ₹
                  {filteredSpots.length > 0
                    ? Math.round(
                        filteredSpots.reduce(
                          (acc, spot) => acc + spot.pricePerHour,
                          0,
                        ) / filteredSpots.length,
                      )
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Price/hr</div>
              </Card>

              <Card className="text-center p-4 border-0 bg-card/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-chart-5 mb-1">
                  {filteredSpots.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Spots</div>
              </Card>

              <Card className="text-center p-4 border-0 bg-card/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-chart-3 mb-1">
                  {filteredSpots.reduce((acc, spot) => acc + spot.availableSpots, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Available Spots</div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
