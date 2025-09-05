'use client'
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, RotateCcw, Clock, Route } from "lucide-react";
import { MainNavigation } from "@/components/navigation";

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
        .on("routesfound", function (e) {
          const routes = e.routes;
          const summary = routes[0].summary;

          setRouteInfo({
            distance: `${(summary.totalDistance / 1000).toFixed(1)} km`,
            duration: `${Math.round(summary.totalTime / 60)} mins`,
            fromAddress: fromCoords.display_name,
            toAddress: toCoords.display_name,
          });
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
      <MainNavigation/>
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
