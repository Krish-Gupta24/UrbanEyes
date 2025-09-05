import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count();
    return NextResponse.json({ 
      message: "Database connected successfully", 
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Database connection failed", 
      details: error.message 
    }, { status: 500 });
  }
}
