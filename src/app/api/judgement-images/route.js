import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import JudgementImage from "@/models/JudgementImage";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";

// POST - Generate and save judgement image
export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    

    const formData = await request.formData();
    const imageFile = formData.get("image");
    const inputDataRaw = formData.get("inputData");
    
    if (!inputDataRaw) {
      return NextResponse.json(
        { error: "No input data provided" },
        { status: 400 }
      );
    }
    
    const inputData = JSON.parse(inputDataRaw);

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const filename = `judgement_${timestamp}.png`;
    
    // Use absolute path for better compatibility
    const uploadDir = path.join(process.cwd(), "public", "uploads", "judgement-images");
    const filePath = path.join(uploadDir, filename);


    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log("Directory created/verified:", uploadDir);
    } catch (dirError) {
      console.error("Directory creation error:", dirError);
      return NextResponse.json(
        { error: "Failed to create upload directory" },
        { status: 500 }
      );
    }

    // Save file
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      await writeFile(filePath, buffer);
      console.log("File saved successfully");
    } catch (writeError) {
      console.error("File write error:", writeError);
      return NextResponse.json(
        { error: "Failed to save image file" },
        { status: 500 }
      );
    }

    const imageUrl = `/uploads/judgement-images/${filename}`;
    
    // Save to database
    const judgementImage = await JudgementImage.create({
      userId: user.id,
      imageUrl,
      inputData,
      templateVersion: "v1",
    });

    console.log("Database entry created:", judgementImage._id);

    return NextResponse.json(
      {
        success: true,
        image: judgementImage,
        imageUrl,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Image upload error - Full details:", error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});

// GET - Fetch recent images
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const images = await JudgementImage.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(images);
    
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
});