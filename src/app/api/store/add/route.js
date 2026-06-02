import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Store from "@/model/storeModel";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Prevent duplicate storeId
    const exists = await Store.findOne({ storeId: body.storeId });
    if (exists) {
      return NextResponse.json(
        { error: "Store ID already exists" },
        { status: 400 }
      );
    }

    // Create new store
    const newStore = await Store.create(body);

    return NextResponse.json({
      success: true,
      data: newStore,
    });
  } catch (error) {
    console.error("Error adding store:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}