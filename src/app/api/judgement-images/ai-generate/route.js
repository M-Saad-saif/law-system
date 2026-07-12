import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import JudgementImage from "@/models/JudgementImage";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";
import { generateJudgementImage } from "@/lib/ai/imageService";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Generate a brand-new AI image from case details (not a screenshot)
export const POST = withAuth(async (request, context, user) => {
  try {
    const inputData = await request.json();

    if (!inputData || (!inputData.judgementTitle && !inputData.caseNumber)) {
      return NextResponse.json(
        { error: "No case details provided" },
        { status: 400 },
      );
    }

    const result = await generateJudgementImage(inputData);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    await connectDB();

    const mimeType = result.mimeType || "image/png";
    const dataUri = `data:${mimeType};base64,${result.base64}`;

    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "lawportal/judgement-images",
        resource_type: "image",
        public_id: `judgement_ai_${Date.now()}`,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload AI image to Cloudinary" },
        { status: 500 },
      );
    }

    const judgementImage = await JudgementImage.create({
      userId: user.id,
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      inputData,
      templateVersion: "ai-v1",
    });

    return NextResponse.json(
      {
        success: true,
        image: judgementImage,
        imageUrl: uploadResult.secure_url,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("AI image generation error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
});
