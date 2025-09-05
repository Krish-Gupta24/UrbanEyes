"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Navigation, Trash2, Users } from "lucide-react"

export function ParkingSpotCard({ 
  spot, 
  showDeleteButton = false, 
  onDelete = null, 
  isDeleting = false,
  onBook = null,
  onNavigate = null,
  className = ""
}) {
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

  const availability = getAvailabilityText(spot.availableSpots, spot.totalSpots)

  const handleBook = () => {
    if (onBook) {
      onBook(spot)
    } else {
      window.open('/booking', '_blank')
    }
  }

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(spot)
    } else {
      window.open('/route', '_blank')
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(spot.id)
    }
  }

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{spot.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {spot.distance > 0 ? `${spot.distance.toFixed(2)} km away` : 'Location available'}
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
            onClick={handleBook}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {availability === "full" ? "Full" : "Book Now"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={availability === "full"}
            onClick={handleNavigate}
          >
            <MapPin className="h-4 w-4" />
          </Button>
          {showDeleteButton && (
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ParkingSpotListItem({ 
  spot, 
  showDeleteButton = false, 
  onDelete = null, 
  isDeleting = false,
  onBook = null,
  onNavigate = null,
  className = "",
  onClick = null
}) {
  const getAvailabilityText = (availableSpots, totalSpots) => {
    if (availableSpots === 0) return "full"
    if (availableSpots <= 2) return "limited"
    return "available"
  }

  const availability = getAvailabilityText(spot.availableSpots, spot.totalSpots)

  const handleBook = (e) => {
    e.stopPropagation()
    if (onBook) {
      onBook(spot)
    } else {
      window.open('/booking', '_blank')
    }
  }

  const handleNavigate = (e) => {
    e.stopPropagation()
    if (onNavigate) {
      onNavigate(spot)
    } else {
      window.open('/route', '_blank')
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(spot.id)
    }
  }

  return (
    <div
      className={`p-3 border rounded-lg hover:bg-purple-50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
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
            {spot.distance > 0 ? `${spot.distance} km` : 'Available'}
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
        <div className="flex items-center gap-2">
          <Badge 
            variant={spot.availableSpots > 0 ? "default" : "destructive"}
            className="text-xs"
          >
            {availability === "available" ? "Available" : availability === "limited" ? "Limited" : "Full"}
          </Badge>
          {showDeleteButton && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDelete}
              className="h-6 w-6 p-0"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {spot.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {spot.description}
        </p>
      )}

      <div className="flex gap-2 mt-2">
        <Button
          size="sm"
          disabled={availability === "full"}
          onClick={handleBook}
          className="flex-1 h-6 text-xs"
        >
          Book Now
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={availability === "full"}
          onClick={handleNavigate}
          className="h-6 px-2 text-xs"
        >
          <MapPin className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
