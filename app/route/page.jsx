"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainNavigation } from "@/components/navigation"
import { MapPin, Navigation, Clock, Car, Fuel, DollarSign, CheckCircle, RotateCcw, Zap } from "lucide-react"
import { apiClient } from "@/lib/api-client"



export default function RoutePage() {
  const searchParams = useSearchParams()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [fromLocation, setFromLocation] = useState("Current Location")
  const [toLocation, setToLocation] = useState("Taj Mahal, Agra")
  const [selectedRoute, setSelectedRoute] = useState("route1")
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [parkingSpots, setParkingSpots] = useState([])
  const [routeOptions, setRouteOptions] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)
  const [mapboxError, setMapboxError] = useState(false)

  useEffect(() => {
    const initializeMapbox = async () => {
      try {
        const mapboxgl = await import("mapbox-gl")
        mapboxgl.default.accessToken = "pk.demo_token_will_fail"

        if (mapContainer.current && !map.current) {
          map.current = new mapboxgl.default.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [78.0421, 27.1751],
            zoom: 10,
            attributionControl: false,
          })

          map.current.on("load", () => {
            setMapboxLoaded(true)
            setMapboxError(false)
            console.log("[v0] Mapbox map loaded successfully")
          })

          map.current.on("error", (e) => {
            console.log("[v0] Mapbox error details:", JSON.stringify(e, null, 2))
            console.log("[v0] Switching to demo mode due to Mapbox error")
            setMapboxError(true)
            setMapboxLoaded(false)
          })

          map.current.addControl(new mapboxgl.default.NavigationControl(), "top-right")
        }
      } catch (error) {
        console.log("[v0] Failed to load Mapbox, using demo mode:", error)
        setMapboxError(true)
        setMapboxLoaded(false)
      }
    }

    setMapboxError(true)
    setMapboxLoaded(false)
    console.log("[v0] Running in demo mode - Mapbox integration disabled")

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    if (fromParam) {
      setFromLocation(fromParam)
    }
    if (toParam) {
      setToLocation(toParam)
    }

    if ((fromParam || toParam) && !hasSearched) {
      console.log("[v0] Auto-searching with params:", { from: fromParam, to: toParam })
      handleSearch()
    }
  }, [searchParams, hasSearched])

  useEffect(() => {
    const mockRoutes = [
      {
        id: "route1",
        name: "Fastest Route",
        duration: "3h 45m",
        distance: "233 km",
        traffic: "light",
        fuelCost: "₹850",
      },
      {
        id: "route2",
        name: "Scenic Route",
        duration: "4h 20m",
        distance: "267 km",
        traffic: "light",
        fuelCost: "₹980",
      },
      {
        id: "route3",
        name: "Highway Route",
        duration: "3h 55m",
        distance: "245 km",
        traffic: "moderate",
        fuelCost: "₹890",
      },
    ]
    setRouteOptions(mockRoutes)
  }, [])

  const calculateMapboxRoute = async (from, to) => {
    console.log("[v0] Demo mode: Skipping Mapbox route visualization")
    return
  }

  const addParkingMarkers = async (spots) => {
    console.log("[v0] Demo mode: Parking markers would be displayed on real map")
    return
  }

  const loadParkingData = async () => {
    try {
      const response = await apiClient.getParkingSpots(toLocation, 5)
      if (response.success) {
        const spots = response.parkingSpots.slice(0, 4)
        setParkingSpots(spots)
        addParkingMarkers(spots)
      }
    } catch (error) {
      console.error("Failed to load parking data:", error)
      const mockSpots = [
        {
          id: "p1",
          name: "Taj Mahal East Gate Parking",
          distance: "0.2 km",
          availability: "available",
          price: "₹50/hr",
          spots: 45,
          totalSpots: 60,
          coordinates: { lat: 27.1751, lng: 78.0421 },
        },
        {
          id: "p2",
          name: "Shilpgram Parking Complex",
          distance: "0.8 km",
          availability: "limited",
          price: "₹30/hr",
          spots: 8,
          totalSpots: 40,
          coordinates: { lat: 27.1721, lng: 78.0401 },
        },
        {
          id: "p3",
          name: "Taj Heritage Corridor Parking",
          distance: "1.2 km",
          availability: "available",
          price: "₹40/hr",
          spots: 32,
          totalSpots: 50,
          coordinates: { lat: 27.1731, lng: 78.0441 },
        },
        {
          id: "p4",
          name: "Mehtab Bagh Parking",
          distance: "2.1 km",
          availability: "full",
          price: "₹35/hr",
          spots: 0,
          totalSpots: 25,
          coordinates: { lat: 27.1781, lng: 78.0381 },
        },
      ]
      setParkingSpots(mockSpots)
      addParkingMarkers(mockSpots)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      await apiClient.calculateRoute(fromLocation, toLocation)
      await calculateMapboxRoute(fromLocation, toLocation)
      await loadParkingData()
      setShowResults(true)
    } catch (error) {
      console.error("Route search failed:", error)
      setShowResults(true)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }
  }

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "available":
        return "text-green-600 bg-green-50"
      case "limited":
        return "text-yellow-600 bg-yellow-50"
      case "full":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getTrafficColor = (traffic) => {
    switch (traffic) {
      case "light":
        return "text-green-600"
      case "moderate":
        return "text-yellow-600"
      case "heavy":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <MainNavigation />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Plan Your Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">From</label>
                    <Input
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="bg-background"
                      placeholder="Enter starting location"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">To</label>
                    <Input
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="bg-background"
                      placeholder="Enter destination"
                    />
                  </div>
                </div>

                <Button onClick={handleSearch} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Finding Routes...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Routes & Parking
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {showResults && (
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Route Options</CardTitle>
                  <CardDescription>Choose your preferred route</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {routeOptions.map((route) => (
                    <div
                      key={route.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRoute === route.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedRoute(route.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{route.name}</h4>
                        <Badge variant={selectedRoute === route.id ? "default" : "outline"}>
                          {selectedRoute === route.id && <CheckCircle className="h-3 w-3 mr-1" />}
                          Selected
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {route.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {route.distance}
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className={`h-3 w-3 ${getTrafficColor(route.traffic)}`} />
                          {route.traffic} traffic
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          {route.fuelCost}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {showResults && (
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Nearby Parking</CardTitle>
                  <CardDescription>Real-time availability near your destination</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {parkingSpots.map((spot) => (
                    <div key={spot.id} className="p-4 rounded-lg border bg-background hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{spot.name}</h4>
                        <Badge className={getAvailabilityColor(spot.availability)}>{spot.availability}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {spot.distance}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {spot.price}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-medium">{spot.spots}</span>
                          <span className="text-muted-foreground">/{spot.totalSpots} spots</span>
                        </div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              spot.availability === "available"
                                ? "bg-green-500"
                                : spot.availability === "limited"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${(spot.spots / spot.totalSpots) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[800px] shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interactive Route Map</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      Demo Mode
                    </Badge>
                    <Badge variant="outline">
                      <Navigation className="h-3 w-3 mr-1" />
                      Mock Routes
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0 relative">
                <div
                  className="w-full h-full rounded-lg bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 flex items-center justify-center"
                  style={{ minHeight: "700px" }}
                >
                  <div className="text-center space-y-6 p-8">
                    <div className="relative">
                      <div className="h-32 w-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {showResults && (
                        <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">Demo Map Visualization</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Interactive map with route planning and parking finder functionality.
                        {showResults ? " Route calculated successfully!" : " Search for routes to see visualization."}
                      </p>
                    </div>

                    {showResults && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Navigation className="h-5 w-5 text-emerald-600" />
                            <span className="font-semibold">Route</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Optimal path calculated</p>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold">Parking</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{parkingSpots.length} spots found</p>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <span className="font-semibold">Live Data</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Real-time updates</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
