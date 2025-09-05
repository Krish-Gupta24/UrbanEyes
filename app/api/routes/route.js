import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { from, to, preferences } = await request.json();

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockRoutes = [
      {
        id: "route_1",
        name: "Fastest Route",
        duration: "3h 45m",
        distance: "233 km",
        traffic: "light",
        fuelCost: "₹850",
        tolls: "₹120",
        coordinates: [
          { lat: 28.6139, lng: 77.209 }, // Delhi
          { lat: 27.1767, lng: 78.0081 }, // Agra
        ],
        instructions: [
          "Head southeast on NH19",
          "Continue on NH19 for 180 km",
          "Take exit toward Agra",
          "Continue to destination",
        ],
        estimatedArrival: new Date(
          Date.now() + 3.75 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "route_2",
        name: "Scenic Route",
        duration: "4h 20m",
        distance: "267 km",
        traffic: "light",
        fuelCost: "₹980",
        tolls: "₹80",
        coordinates: [
          { lat: 28.6139, lng: 77.209 },
          { lat: 27.5706, lng: 77.7258 }, // Mathura
          { lat: 27.1767, lng: 78.0081 },
        ],
        instructions: [
          "Head south on NH2",
          "Continue through Mathura",
          "Take scenic route via Vrindavan",
          "Continue to Agra",
        ],
        estimatedArrival: new Date(
          Date.now() + 4.33 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "route_3",
        name: "Highway Route",
        duration: "3h 55m",
        distance: "245 km",
        traffic: "moderate",
        fuelCost: "₹890",
        tolls: "₹150",
        coordinates: [
          { lat: 28.6139, lng: 77.209 },
          { lat: 27.1767, lng: 78.0081 },
        ],
        instructions: [
          "Take Yamuna Expressway",
          "Continue for 165 km",
          "Merge onto Agra-Lucknow Expressway",
          "Exit toward Taj Mahal",
        ],
        estimatedArrival: new Date(
          Date.now() + 3.92 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      routes: mockRoutes,
      searchQuery: { from, to },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to calculate routes" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Route API endpoint. Use POST to calculate routes.",
    endpoints: {
      calculateRoute: "POST /api/routes",
      parameters: ["from", "to", "preferences"],
    },
  });
}
