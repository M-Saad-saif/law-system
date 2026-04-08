import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import JudgementImage from "@/models/JudgementImage";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";
import { error } from "console";

export const POST = withAuth(async (request, user) => {
  try {
    await connectDB();

    const formData = await request.formData();
    const imageFile = formData.get("image");
    const inputDataRaw = formData.get("inputData");
    const inputData = JSON.parse(inputDataRaw);

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const filename = `judgement_${timestamp}.png`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "judgement-images",
    );
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/judgement-images/${filename}`;
    const judgementImage = await JudgementImage.create({
      userId: user.id,
      imageUrl,
      inputData,
      templateVersion: "v1",
    });

    return NextResponse.json(
      {
        success: true,
        image: judgementImage,
        imageUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
