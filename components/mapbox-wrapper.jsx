"use client"

import { useEffect, useRef, useState } from "react"

interface MapboxWrapperProps {
  onMapLoad?: (map: any) => void
  center?: [number, number]
  zoom?: number
  className?: string
}

export function MapboxWrapper({
  onMapLoad,
  center = [78.0421, 27.1751],
  zoom = 10,
  className = "w-full h-full",
}: MapboxWrapperProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const mapboxgl = await import("mapbox-gl")

        // Use demo token for development - replace with your own token in production
        mapboxgl.default.accessToken =
          "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"

        if (mapContainer.current && !map.current) {
          map.current = new mapboxgl.default.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: center,
            zoom: zoom,
            attributionControl: false,
          })

          // Add navigation controls
          map.current.addControl(new mapboxgl.default.NavigationControl(), "top-right")

          // Add attribution control at bottom right
          map.current.addControl(
            new mapboxgl.default.AttributionControl({
              compact: true,
            }),
            "bottom-right",
          )

          map.current.on("load", () => {
            setIsLoaded(true)
            onMapLoad?.(map.current)
            console.log("[v0] Mapbox map initialized successfully")
          })

          map.current.on("error", (e: any) => {
            console.error("[v0] Mapbox error:", e)
          })
        }
      } catch (error) {
        console.error("[v0] Failed to initialize Mapbox:", error)
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center, zoom, onMapLoad])

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" style={{ minHeight: "400px" }} />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading interactive map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
