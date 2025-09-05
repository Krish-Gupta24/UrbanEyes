"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MainNavigation } from "@/components/navigation"
import { Camera, Info, MapPin, Star, Volume2, VolumeX, Maximize, RotateCcw, Zap, Eye, Scan } from "lucide-react"


export default function ARPage() {
  const [isARActive, setIsARActive] = useState(false)
  const [detectedLandmarks, setDetectedLandmarks] = useState([])
  const [selectedLandmark, setSelectedLandmark] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const videoRef = useRef(null)

  const landmarks = [
    {
      id: "taj-mahal",
      name: "Taj Mahal",
      description: "An ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, India.",
      historicalFacts: [
        "Built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal",
        "Construction took 22 years (1632-1654) and employed 20,000 artisans",
        "The main dome is 35 meters high and surrounded by four smaller domes",
        "Made primarily of white marble inlaid with semi-precious stones",
        "UNESCO World Heritage Site since 1983",
      ],
      yearBuilt: "1632-1654",
      architect: "Ustad Ahmad Lahori",
      visitors: "6-8 million annually",
      rating: 4.9,
      audioGuide: true,
      images: ["/taj-mahal-front-view.jpg"],
      position: { x: 45, y: 35 },
      detected: false,
    },
    {
      id: "agra-fort",
      name: "Agra Fort",
      description: "A historical fortified palace of red sandstone located in Agra, India.",
      historicalFacts: [
        "Built by the Mughal Emperor Akbar in 1565",
        "Served as the main residence of the Mughal Dynasty until 1638",
        "Contains numerous palaces, mosques, and audience halls",
        "Made of red sandstone with marble inlays",
        "UNESCO World Heritage Site since 1983",
      ],
      yearBuilt: "1565",
      architect: "Akbar the Great",
      visitors: "2-3 million annually",
      rating: 4.6,
      audioGuide: true,
      images: ["/placeholder-9ybfz.png"],
      position: { x: 65, y: 55 },
      detected: false,
    },
    {
      id: "mehtab-bagh",
      name: "Mehtab Bagh",
      description: "A charbagh complex in Agra, India, lying north of the Taj Mahal complex.",
      historicalFacts: [
        "Originally built by Emperor Babur as the last of eleven parks",
        "Offers the best sunset view of the Taj Mahal",
        "Restored by the Archaeological Survey of India in the 1990s",
        "Features traditional Mughal garden layout with fountains",
        "Popular spot for photography and peaceful walks",
      ],
      yearBuilt: "1631",
      architect: "Mughal Garden Designers",
      visitors: "500k annually",
      rating: 4.3,
      audioGuide: false,
      images: ["/placeholder-sfv7n.png"],
      position: { x: 25, y: 65 },
      detected: false,
    },
  ]

  const startAR = async () => {
    setIsARActive(true)
    setIsScanning(true)

    // Simulate camera access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.log("Camera access denied, using mock video")
    }

    // Simulate landmark detection after 3 seconds
    setTimeout(() => {
      setIsScanning(false)
      const detectedLandmark = landmarks[0] // Simulate detecting Taj Mahal
      setDetectedLandmarks([{ ...detectedLandmark, detected: true }])
    }, 3000)

    // Add more landmarks gradually
    setTimeout(() => {
      setDetectedLandmarks((prev) => [...prev, { ...landmarks[1], detected: true }])
    }, 5000)

    setTimeout(() => {
      setDetectedLandmarks((prev) => [...prev, { ...landmarks[2], detected: true }])
    }, 7000)
  }

  const stopAR = () => {
    setIsARActive(false)
    setDetectedLandmarks([])
    setSelectedLandmark(null)
    setIsScanning(false)

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject 
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">

      <div className="container mx-auto px-4 py-8">
        {!isARActive ? (
          // AR Introduction Screen
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-6 animate-pulse">
                <Eye className="h-4 w-4 mr-2" />
                Augmented Reality Experience
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Discover History Through AR
              </h1>

              <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
                Point your camera at landmarks to unlock rich historical information, interactive content, and immersive
                experiences.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Scan className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Real-time Detection</CardTitle>
                  <CardDescription>Advanced AI recognizes landmarks instantly as you point your camera</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Info className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Rich Information</CardTitle>
                  <CardDescription>Access historical facts, architect details, and visitor information</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Volume2 className="h-6 w-6 text-chart-5" />
                  </div>
                  <CardTitle className="text-lg">Audio Guides</CardTitle>
                  <CardDescription>Listen to expert narrations and immersive storytelling</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Start AR Button */}
            <Button onClick={startAR} size="lg" className="text-lg px-8 py-6">
              <Camera className="h-6 w-6 mr-3" />
              Start AR Experience
            </Button>

            <p className="text-sm text-muted-foreground mt-4">Camera access required for AR functionality</p>
          </div>
        ) : (
          // AR Camera View
          <div className="relative h-screen -mt-8 -mx-4 bg-black overflow-hidden">
            {/* Camera Feed */}
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

            {/* Mock Camera Feed Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20" />

            {/* AR Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
              <div className="flex items-center gap-2">
                <Button
                  onClick={stopAR}
                  variant="outline"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white border-white/20"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Exit AR
                </Button>
                <Badge className="bg-red-500/80 text-white animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  LIVE
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  variant="outline"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white border-white/20"
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" className="bg-black/50 backdrop-blur-sm text-white border-white/20">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <div className="text-center text-white">
                  <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">Scanning for Landmarks...</h3>
                  <p className="text-white/80">Point your camera at a landmark</p>
                </div>
              </div>
            )}

            {/* AR Landmark Overlays */}
            {detectedLandmarks.map((landmark) => (
              <div
                key={landmark.id}
                className="absolute z-30 animate-fade-in"
                style={{
                  left: `${landmark.position.x}%`,
                  top: `${landmark.position.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* AR Marker */}
                <div className="relative">
                  <div
                    className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse cursor-pointer"
                    onClick={() => setSelectedLandmark(landmark)}
                  >
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                  </div>

                  {/* Landmark Label */}
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    {landmark.name}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
                  </div>
                </div>
              </div>
            ))}

            {/* Landmark Information Panel */}
            {selectedLandmark && (
              <div className="absolute bottom-4 left-4 right-4 z-50">
                <Card className="bg-black/80 backdrop-blur-sm text-white border-white/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-xl">{selectedLandmark.name}</CardTitle>
                        <CardDescription className="text-white/80 mt-1">{selectedLandmark.description}</CardDescription>
                      </div>
                      <Button
                        onClick={() => setSelectedLandmark(null)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-white/60">Built</div>
                        <div className="font-semibold">{selectedLandmark.yearBuilt}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Architect</div>
                        <div className="font-semibold text-xs">{selectedLandmark.architect}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Visitors</div>
                        <div className="font-semibold text-xs">{selectedLandmark.visitors}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Rating</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{selectedLandmark.rating}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/20" />

                    {/* Historical Facts */}
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Historical Facts</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedLandmark.historicalFacts.slice(0, 3).map((fact, index) => (
                          <div key={index} className="text-sm text-white/80 flex items-start gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {fact}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {selectedLandmark.audioGuide && (
                        <Button size="sm" className="flex-1">
                          <Volume2 className="h-4 w-4 mr-2" />
                          Audio Guide
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-white border-white/20 hover:bg-white/20 bg-transparent"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-white/20 hover:bg-white/20 bg-transparent"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AR Stats */}
            <div className="absolute top-20 left-4 z-40">
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-green-400" />
                  <span>AR Active</span>
                </div>
                <div className="text-white/80 text-xs">{detectedLandmarks.length} landmarks detected</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
