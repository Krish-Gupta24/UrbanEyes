"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Volume2, MapPin, Camera } from "lucide-react"


export function ARLandmarkCard({ landmark, onNavigate, onAudioGuide }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{landmark.name}</CardTitle>
            <CardDescription className="mt-1">{landmark.description}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{landmark.rating}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Built</div>
            <div className="font-semibold">{landmark.yearBuilt}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Visitors</div>
            <div className="font-semibold">{landmark.visitors}</div>
          </div>
        </div>

        {/* Architect */}
        <div className="text-sm">
          <div className="text-muted-foreground">Architect</div>
          <div className="font-semibold">{landmark.architect}</div>
        </div>

        {/* Historical Facts Preview */}
        <div>
          <h4 className="font-semibold mb-2 text-sm">Historical Facts</h4>
          <div className="space-y-1">
            {landmark.historicalFacts.slice(0, 2).map((fact, index) => (
              <div key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                {fact}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {landmark.audioGuide && (
            <Badge variant="secondary" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              Audio Guide
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Camera className="h-3 w-3 mr-1" />
            AR Ready
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {landmark.audioGuide && (
            <Button onClick={onAudioGuide} size="sm" className="flex-1">
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </Button>
          )}
          <Button onClick={onNavigate} variant="outline" size="sm" className="flex-1 bg-transparent">
            <MapPin className="h-4 w-4 mr-2" />
            Navigate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
