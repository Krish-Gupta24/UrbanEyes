'use client'
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, RotateCcw, Clock, Route, Car, Users, DollarSign, RefreshCw, AlertCircle } from "lucide-react";
import { MainNavigation } from "@/components/navigation";
import { toast } from "sonner";

export default function RoutePage() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [fromLocation, setFromLocation] = useState("Agra Fort");
  const [toLocation, setToLocation] = useState("Taj Mahal, Agra");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [parkingMarkers, setParkingMarkers] = useState([]);
  const [eta, setEta] = useState(null);

  // Handle URL parameters from home screen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    
    if (fromParam) setFromLocation(fromParam);
    if (toParam) setToLocation(toParam);
  }, []);

  // Initialize map
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS and JS
        if (!document.getElementById("leaflet-css")) {
          const css = document.createElement("link");
          css.id = "leaflet-css";
          css.rel = "stylesheet";
          css.href =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
          document.head.appendChild(css);
        }

        if (!document.getElementById("leaflet-routing-css")) {
          const routingCss = document.createElement("link");
          routingCss.id = "leaflet-routing-css";
          routingCss.rel = "stylesheet";
          routingCss.href =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.css";
          document.head.appendChild(routingCss);
        }

        // Load scripts
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!window.L?.Routing) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize map
        if (mapRef.current && !leafletMapRef.current) {
          leafletMapRef.current = window.L.map(mapRef.current).setView(
            [27.1751, 78.0421],
            13
          );

          window.L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution: "© OpenStreetMap contributors",
              maxZoom: 19,
            }
          ).addTo(leafletMapRef.current);

          setMapLoaded(true);
        }
      } catch (err) {
        console.error("Error loading map:", err);
        setError("Failed to load map. Please refresh the page.");
      }
    };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const geocodeLocation = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        };
      }
      throw new Error("Location not found");
    } catch (err) {
      throw new Error(`Failed to find location: ${location}`);
    }
  };

  const fetchNearbyParkingSpots = async (lat, lng) => {
    try {
      setLoadingSpots(true);
      const response = await fetch(
        `/api/parking-spots/nearby?lat=${lat}&lng=${lng}&radius=2`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNearbySpots(data.spots || []);
        return data.spots || [];
      } else {
        throw new Error("Failed to fetch parking spots");
      }
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      toast.error("Failed to load parking spots");
      return [];
    } finally {
      setLoadingSpots(false);
    }
  };

  const calculateETA = (duration) => {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + duration * 1000);
    setEta(arrivalTime);
    return arrivalTime;
  };

  const addParkingMarkersToMap = (spots) => {
    if (!leafletMapRef.current || !spots.length) return;

    // Clear existing parking markers
    parkingMarkers.forEach(marker => {
      leafletMapRef.current.removeLayer(marker);
    });

    const newMarkers = spots.map(spot => {
      const marker = window.L.marker([spot.latitude, spot.longitude], {
        icon: window.L.divIcon({
          className: 'parking-marker',
          html: `
            <div class="parking-marker-content">
              <div class="parking-icon ${spot.availableSpots > 0 ? 'available' : 'full'}">
                🚗
              </div>
              <div class="parking-info">
                <div class="price">₹${spot.pricePerHour}/hr</div>
                <div class="availability">${spot.availableSpots}/${spot.totalSpots}</div>
              </div>
            </div>
          `,
          iconSize: [60, 40],
          iconAnchor: [30, 20],
          popupAnchor: [0, -20]
        })
      });

      marker.bindPopup(`
        <div class="parking-popup">
          <h3 class="font-bold text-lg">${spot.title}</h3>
          <p class="text-sm text-gray-600 mb-2">${spot.address}</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Price:</span>
              <span class="font-medium">₹${spot.pricePerHour}/hour</span>
            </div>
            <div class="flex justify-between">
              <span>Available:</span>
              <span class="font-medium">${spot.availableSpots}/${spot.totalSpots} spots</span>
            </div>
            <div class="flex justify-between">
              <span>Distance:</span>
              <span class="font-medium">${spot.distance} km</span>
            </div>
          </div>
          <div class="mt-3">
            <button onclick="window.open('/booking', '_blank')" 
                    class="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Book Now
            </button>
          </div>
        </div>
      `);

      return marker;
    });

    // Add markers to map
    newMarkers.forEach(marker => {
      marker.addTo(leafletMapRef.current);
    });

    setParkingMarkers(newMarkers);
  };

  const handleSearch = async () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      setError("Please enter both starting location and destination");
      return;
    }

    if (!leafletMapRef.current) {
      setError("Map not loaded yet. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRouteInfo(null);

    try {
      // Clear existing route
      if (routingControlRef.current) {
        leafletMapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      // Geocode locations
      const [fromCoords, toCoords] = await Promise.all([
        geocodeLocation(fromLocation),
        geocodeLocation(toLocation),
      ]);

      // Store destination coordinates for parking spot search
      setDestinationCoords(toCoords);

      // Create routing control
      routingControlRef.current = window.L.Routing.control({
        waypoints: [
          window.L.latLng(fromCoords.lat, fromCoords.lng),
          window.L.latLng(toCoords.lat, toCoords.lng),
        ],
        routeWhileDragging: false,
        createMarker: function (i, waypoint, n) {
          const marker = window.L.marker(waypoint.latLng, {
            draggable: false,
          });

          if (i === 0) {
            marker.bindPopup(`<b>Start:</b> ${fromCoords.display_name}`);
          } else if (i === n - 1) {
            marker.bindPopup(`<b>Destination:</b> ${toCoords.display_name}`);
          }

          return marker;
        },
        lineOptions: {
          styles: [{ color: "#4285f4", weight: 5, opacity: 0.8 }],
        },
        show: false, // Hide the built-in instruction panel
        addWaypoints: false,
      })
        .on("routesfound", async function (e) {
          const routes = e.routes;
          const summary = routes[0].summary;

          // Calculate ETA
          const arrivalTime = calculateETA(summary.totalTime);

          setRouteInfo({
            distance: `${(summary.totalDistance / 1000).toFixed(1)} km`,
            duration: `${Math.round(summary.totalTime / 60)} mins`,
            fromAddress: fromCoords.display_name,
            toAddress: toCoords.display_name,
            eta: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

          // Fetch nearby parking spots after route is found
          const spots = await fetchNearbyParkingSpots(toCoords.lat, toCoords.lng);
          addParkingMarkersToMap(spots);
        })
        .addTo(leafletMapRef.current);
    } catch (err) {
      console.error("Error fetching route:", err);
      setError(
        err.message || "Failed to find route. Please check your locations."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <style jsx global>{`
        .parking-marker-content {
          background: white;
          border: 2px solid #8b5cf6;
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }
        
        .parking-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        
        .parking-icon.available {
          background: #10b981;
        }
        
        .parking-icon.full {
          background: #ef4444;
        }
        
        .parking-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 10px;
          line-height: 1.2;
        }
        
        .parking-info .price {
          font-weight: bold;
          color: #8b5cf6;
        }
        
        .parking-info .availability {
          color: #6b7280;
        }
        
        .parking-popup {
          min-width: 200px;
        }
        
        .parking-popup h3 {
          margin: 0 0 8px 0;
        }
        
        .parking-popup .space-y-1 > * + * {
          margin-top: 4px;
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Navigation className="h-5 w-5" />
                Plan Your Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  From
                </label>
                <Input
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter starting location"
                  className="border-indigo-200 focus:border-indigo-400"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapLocations}
                  className="rounded-full p-2 border-indigo-200 hover:bg-indigo-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  To
                </label>
                <Input
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter destination"
                  className="border-indigo-200 focus:border-indigo-400"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={
                  isLoading ||
                  !fromLocation.trim() ||
                  !toLocation.trim() ||
                  !mapLoaded
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Finding Routes...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Route
                  </>
                )}
              </Button>

              {!mapLoaded && (
                <div className="text-xs text-gray-500 text-center">
                  Loading map...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Information */}
          {routeInfo && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Route className="h-5 w-5" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Distance:
                    </span>
                    <span className="font-bold text-green-700">
                      {routeInfo.distance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration:
                    </span>
                    <span className="font-bold text-blue-700">
                      {routeInfo.duration}
                    </span>
                  </div>
                  {routeInfo.eta && (
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        ETA:
                      </span>
                      <span className="font-bold text-purple-700">
                        {routeInfo.eta}
                      </span>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">From:</span>
                      <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                        {routeInfo.fromAddress}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">To:</span>
                      <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                        {routeInfo.toAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nearby Parking Spots */}
          {destinationCoords && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-purple-700">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Nearby Parking
                  </div>
                  <div className="flex items-center gap-2">
                    {loadingSpots && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <Badge variant="outline" className="text-xs">
                      2km radius
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSpots ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-gray-600">Finding parking spots...</p>
                  </div>
                ) : nearbySpots.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {nearbySpots.map((spot, index) => (
                      <div
                        key={spot.id}
                        className="p-3 border rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Center map on this parking spot
                          if (leafletMapRef.current) {
                            leafletMapRef.current.setView([spot.latitude, spot.longitude], 16);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{spot.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{spot.address}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-purple-700">
                              ₹{spot.pricePerHour}/hr
                            </div>
                            <div className="text-xs text-gray-500">
                              {spot.distance} km
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className={spot.availableSpots > 0 ? "text-green-600" : "text-red-600"}>
                              {spot.availableSpots}/{spot.totalSpots} available
                            </span>
                          </div>
                          <Badge 
                            variant={spot.availableSpots > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {spot.availableSpots > 0 ? "Available" : "Full"}
                          </Badge>
                        </div>
                        
                        {spot.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {spot.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">No parking spots found within 2km</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try searching in a different area
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="h-[800px] shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-indigo-700">
                OpenStreetMap Route
              </CardTitle>
              <p className="text-sm text-gray-600">
                Free • No API key required
              </p>
            </CardHeader>
            <CardContent className="h-full p-0">
              <div
                ref={mapRef}
                className="w-full h-full rounded-b-lg"
                style={{ minHeight: "700px" }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
