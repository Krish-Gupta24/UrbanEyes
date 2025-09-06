"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MainNavigation } from "@/components/navigation"
import { Camera, Info, MapPin, Star, Volume2, VolumeX, Maximize, RotateCcw, Zap, Eye, Scan, Car, ParkingCircle } from "lucide-react"
import io from 'socket.io-client'

export default function ARPage() {
  const [isARActive, setIsARActive] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState({ cars: [], parking_spaces: [] })
  const [selectedDetection, setSelectedDetection] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [frame, setFrame] = useState('')
  const [detectionStats, setDetectionStats] = useState({ total_cars: 0, total_spaces: 0 })
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // OpenCV server URL - change this to your OpenCV laptop IP
  const OPENCV_SERVER_URL = 'http://localhost:5000' // Change to http://YOUR_OPENCV_LAPTOP_IP:5000

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(OPENCV_SERVER_URL)
    
    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to OpenCV detection server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from OpenCV detection server')
    })

    newSocket.on('detection_result', (data) => {
      setFrame(data.frame)
      setDetectedObjects(data.detections)
      setDetectionStats({
        total_cars: data.detections.total_cars,
        total_spaces: data.detections.total_spaces
      })
      setIsScanning(false)
    })

    newSocket.on('status', (data) => {
      console.log('Server status:', data.message)
    })

    newSocket.on('error', (data) => {
      console.error('Server error:', data.message)
      setIsScanning(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const startAR = async () => {
    if (!isConnected) {
      alert('Not connected to detection server. Please ensure the OpenCV server is running.')
      return
    }

    setIsARActive(true)
    setIsScanning(true)

    // Start detection on OpenCV server
    if (socket) {
      socket.emit('start_detection')
    }
  }

  const stopAR = () => {
    setIsARActive(false)
    setDetectedObjects({ cars: [], parking_spaces: [] })
    setSelectedDetection(null)
    setIsScanning(false)
    setFrame('')
    setDetectionStats({ total_cars: 0, total_spaces: 0 })

    // Stop detection on OpenCV server
    if (socket) {
      socket.emit('stop_detection')
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject 
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const handleCarClick = (car, index) => {
    setSelectedDetection({
      type: 'car',
      data: car,
      index: index,
      title: `Car Detection #${index + 1}`,
      description: `Detected car with ${(car.confidence * 100).toFixed(1)}% confidence`,
      details: [
        `Confidence: ${(car.confidence * 100).toFixed(1)}%`,
        `Bounding Box: [${car.bbox.join(', ')}]`,
        `Class: ${car.class}`,
        `Detection ID: CAR_${index + 1}`
      ]
    })
  }

  const handleParkingSpaceClick = (space, index) => {
    setSelectedDetection({
      type: 'parking_space',
      data: space,
      index: index,
      title: `Parking Space #${index + 1}`,
      description: `Empty parking space detected`,
      details: [
        `Status: ${space.status}`,
        `Area: ${space.area} pixels²`,
        `Bounding Box: [${space.bbox.join(', ')}]`,
        `Space ID: SPACE_${index + 1}`
      ]
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {!isARActive ? (
          // AR Introduction Screen
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Badge variant={isConnected ? "default" : "destructive"} className="mb-6 animate-pulse">
                <Eye className="h-4 w-4 mr-2" />
                {isConnected ? 'OpenCV Server Connected' : 'OpenCV Server Disconnected'}
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                AI-Powered Car Detection
              </h1>

              <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
                Advanced YOLO-based detection system that identifies cars and parking spaces in real-time using computer vision.
              </p>
            </div>

            {/* Connection Status */}
            <div className="mb-8">
              <Card className="border-0 bg-card/50 backdrop-blur-sm max-w-md mx-auto">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 mx-auto ${
                    isConnected ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    } animate-pulse`} />
                  </div>
                  <CardTitle className="text-lg">
                    {isConnected ? 'Detection Server Online' : 'Detection Server Offline'}
                  </CardTitle>
                  <CardDescription>
                    {isConnected 
                      ? 'Ready to start real-time detection' 
                      : 'Please start the OpenCV server first'
                    }
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Car className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">Car Detection</CardTitle>
                  <CardDescription>YOLO-powered real-time car detection with confidence scores</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <ParkingCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">Parking Analysis</CardTitle>
                  <CardDescription>Automatic detection of empty parking spaces</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Zap className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Real-time Processing</CardTitle>
                  <CardDescription>Live video stream processing at 10 FPS</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Start AR Button */}
            <Button 
              onClick={startAR} 
              size="lg" 
              className="text-lg px-8 py-6" 
              disabled={!isConnected}
            >
              <Camera className="h-6 w-6 mr-3" />
              {isConnected ? 'Start Detection' : 'Server Offline'}
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              {isConnected 
                ? 'OpenCV camera will be used for detection' 
                : 'Please start the detection server first'
              }
            </p>
          </div>
        ) : (
          // AR Camera View
          <div className="relative h-screen -mt-8 -mx-4 bg-black overflow-hidden">
            {/* Camera Feed from OpenCV */}
            {frame ? (
              <img 
                src={`data:image/jpeg;base64,${frame}`}
                alt="Live Detection"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                  <p>Waiting for camera feed...</p>
                </div>
              </div>
            )}

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
                  Exit Detection
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
              </div>
            </div>

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <div className="text-center text-white">
                  <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">Initializing Detection...</h3>
                  <p className="text-white/80">Starting OpenCV camera</p>
                </div>
              </div>
            )}

            {/* Detection Information Panel */}
            {selectedDetection && (
              <div className="absolute bottom-4 left-4 right-4 z-50">
                <Card className="bg-black/80 backdrop-blur-sm text-white border-white/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {selectedDetection.type === 'car' ? (
                          <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Car className="h-5 w-5 text-blue-400" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <ParkingCircle className="h-5 w-5 text-green-400" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-white text-xl">{selectedDetection.title}</CardTitle>
                          <CardDescription className="text-white/80 mt-1">{selectedDetection.description}</CardDescription>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedDetection(null)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Detection Details */}
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Detection Details</h4>
                      <div className="space-y-1">
                        {selectedDetection.details.map((detail, index) => (
                          <div key={index} className="text-sm text-white/80 flex items-start gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-white border-white/20 hover:bg-white/20 bg-transparent"
                        onClick={() => console.log('Track object:', selectedDetection.data)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Track Object
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white border-white/20 hover:bg-white/20 bg-transparent"
                        onClick={() => console.log('Export data:', selectedDetection.data)}
                      >
                        <Info className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detection Stats */}
            <div className="absolute top-20 left-4 z-40">
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-green-400" />
                  <span>Detection Active</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3 text-blue-400" />
                    <span>{detectionStats.total_cars} Cars</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ParkingCircle className="h-3 w-3 text-green-400" />
                    <span>{detectionStats.total_spaces} Spaces</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clickable Detection Areas - Simulated */}
            {frame && (
              <>
                {/* Car detection overlays - positioned based on typical car positions */}
                {detectedObjects.cars.map((car, index) => (
                  <div
                    key={`car-${index}`}
                    className="absolute z-30 cursor-pointer"
                    style={{
                      left: `${20 + (index * 25)}%`,
                      top: `${40 + (index * 10)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => handleCarClick(car, index)}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                      </div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        Car {(car.confidence * 100).toFixed(0)}%
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Parking space overlays */}
                {detectedObjects.parking_spaces.map((space, index) => (
                  <div
                    key={`space-${index}`}
                    className="absolute z-30 cursor-pointer"
                    style={{
                      left: `${60 + (index * 20)}%`,
                      top: `${30 + (index * 15)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => handleParkingSpaceClick(space, index)}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                      </div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        Empty Space
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}