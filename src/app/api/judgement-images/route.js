import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import JudgementImage from "@/models/JudgementImage";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Convert the uploaded blob into a data URI Cloudinary can ingest
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = imageFile.type || "image/png";
    const base64 = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64}`;

    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "lawportal/judgement-images",
        resource_type: "image",
        public_id: `judgement_${Date.now()}`,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }

    // Save to database
    const judgementImage = await JudgementImage.create({
      userId: user.id,
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      inputData,
      templateVersion: "v1",
    });

    return NextResponse.json(
      {
        success: true,
        image: judgementImage,
        imageUrl: uploadResult.secure_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Image upload error - Full details:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
