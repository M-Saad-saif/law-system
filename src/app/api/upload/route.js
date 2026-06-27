// POST /api/upload

import { withAuth, apiError } from "@/lib/api";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return apiError("No file provided.", 400);
    }

    if (!file.type.startsWith("image/")) {
      return apiError("Only image files are allowed.", 400);
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return apiError("File size must be under 5MB.", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "lawportal", 
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (err) {
    return apiError("Failed to upload image. Please try again.", 500);
  }
});
