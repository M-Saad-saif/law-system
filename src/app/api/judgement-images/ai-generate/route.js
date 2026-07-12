import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import JudgementImage from "@/models/JudgementImage";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";
import { generateJudgementImage } from "@/lib/ai/imageService";

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

    const buffer = Buffer.from(result.base64, "base64");
    const timestamp = Date.now();
    const ext = result.mimeType?.includes("png") ? "png" : "jpg";
    const filename = `judgement_ai_${timestamp}.${ext}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "judgement-images",
    );
    const filePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/judgement-images/${filename}`;

    const judgementImage = await JudgementImage.create({
      userId: user.id,
      imageUrl,
      inputData,
      templateVersion: "ai-v1",
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
