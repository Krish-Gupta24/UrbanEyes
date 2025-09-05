import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "Taj Mahal, Agra";
  const radius = Number.parseInt(searchParams.get("radius") || "2");
  const availability = searchParams.get("availability");

  // Simulate real-time data updates
  const baseTime = Date.now();
  const randomFactor = Math.sin(baseTime / 60000); // Changes every minute

  const mockParkingSpots = [
    {
      id: "p1",
      name: "Taj Mahal East Gate Parking",
      address: "Taj East Gate Rd, Dharmapuri, Agra",
      coordinates: { lat: 27.1751, lng: 78.0421 },
      distance: "0.2 km",
      availability: Math.random() > 0.3 ? "available" : "limited",
      price: "₹50/hr",
      rating: 4.5,
      features: ["Security", "CCTV", "24/7", "Covered"],
      phone: "+91 98765 43210",
      hours: "24 Hours",
      spots: Math.max(0, Math.floor(45 + randomFactor * 15)),
      totalSpots: 60,
      lastUpdated: new Date().toISOString(),
      pricePerHour: 50,
      maxStay: "12 hours",
      vehicleTypes: ["car", "motorcycle", "bus"],
    },
    {
      id: "p2",
      name: "Shilpgram Parking Complex",
      address: "Shilpgram Rd, Taj Nagari Phase 1, Agra",
      coordinates: { lat: 27.1721, lng: 78.0401 },
      distance: "0.8 km",
      availability: Math.random() > 0.6 ? "available" : "limited",
      price: "₹30/hr",
      rating: 4.2,
      features: ["Security", "Restrooms", "Food Court"],
      phone: "+91 98765 43211",
      hours: "6 AM - 10 PM",
      spots: Math.max(0, Math.floor(8 + randomFactor * 12)),
      totalSpots: 40,
      lastUpdated: new Date().toISOString(),
      pricePerHour: 30,
      maxStay: "8 hours",
      vehicleTypes: ["car", "motorcycle"],
    },
    {
      id: "p3",
      name: "Taj Heritage Corridor Parking",
      address: "Heritage Corridor, Taj Ganj, Agra",
      coordinates: { lat: 27.1731, lng: 78.0441 },
      distance: "1.2 km",
      availability: "available",
      price: "₹40/hr",
      rating: 4.7,
      features: ["Premium", "Valet", "EV Charging", "Covered"],
      phone: "+91 98765 43212",
      hours: "24 Hours",
      spots: Math.max(0, Math.floor(32 + randomFactor * 18)),
      totalSpots: 50,
      lastUpdated: new Date().toISOString(),
      pricePerHour: 40,
      maxStay: "24 hours",
      vehicleTypes: ["car", "motorcycle", "ev"],
    },
    {
      id: "p4",
      name: "Mehtab Bagh Parking",
      address: "Mehtab Bagh Rd, Nagla Devjit, Agra",
      coordinates: { lat: 27.1781, lng: 78.0381 },
      distance: "2.1 km",
      availability: Math.random() > 0.8 ? "limited" : "full",
      price: "₹35/hr",
      rating: 4.0,
      features: ["Garden View", "Photography Point"],
      phone: "+91 98765 43213",
      hours: "6 AM - 6 PM",
      spots: Math.max(0, Math.floor(randomFactor * 5)),
      totalSpots: 25,
      lastUpdated: new Date().toISOString(),
      pricePerHour: 35,
      maxStay: "6 hours",
      vehicleTypes: ["car", "motorcycle"],
    },
    {
      id: "p5",
      name: "Agra Fort Parking Plaza",
      address: "Agra Fort, Rakabganj, Agra",
      coordinates: { lat: 27.1795, lng: 78.0211 },
      distance: "3.5 km",
      availability: "available",
      price: "₹25/hr",
      rating: 3.8,
      features: ["Budget Friendly", "Historic Location"],
      phone: "+91 98765 43214",
      hours: "6 AM - 8 PM",
      spots: Math.max(0, Math.floor(28 + randomFactor * 7)),
      totalSpots: 35,
      lastUpdated: new Date().toISOString(),
      pricePerHour: 25,
      maxStay: "10 hours",
      vehicleTypes: ["car", "motorcycle"],
    },
  ];

  // Filter by availability if specified
  let filteredSpots = mockParkingSpots;
  if (availability && availability !== "all") {
    filteredSpots = mockParkingSpots.filter(
      (spot) => spot.availability === availability
    );
  }

  // Update availability based on spots
  filteredSpots = filteredSpots.map((spot) => ({
    ...spot,
    availability:
      spot.spots === 0
        ? "full"
        : spot.spots < spot.totalSpots * 0.3
        ? "limited"
        : "available",
  }));

  return NextResponse.json({
    success: true,
    parkingSpots: filteredSpots,
    searchQuery: { location, radius, availability },
    totalSpots: filteredSpots.length,
    availableSpots: filteredSpots.filter((s) => s.availability === "available")
      .length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request) {
  try {
    const { spotId, action, duration } = await request.json();

    // Simulate booking/reservation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (action === "reserve") {
      return NextResponse.json({
        success: true,
        reservation: {
          id: `res_${Date.now()}`,
          spotId,
          duration,
          totalCost: duration * 40, // Mock calculation
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min to arrive
          qrCode: `QR_${spotId}_${Date.now()}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Booking failed" },
      { status: 500 }
    );
  }
}
