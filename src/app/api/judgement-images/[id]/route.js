import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import JudgementImage from "@/models/JudgementImage";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Fetch a single image (used by the view/lightbox modal)
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { id } = context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
    }

    const image = await JudgementImage.findById(id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (user.role !== "admin" && String(image.userId) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Fetch image error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE - Remove an image from Cloudinary  and the database
export const DELETE = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { id } = context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
    }

    const image = await JudgementImage.findById(id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Only the owner (or an admin) can delete the image
    if (user.role !== "admin" && String(image.userId) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (image.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(image.cloudinaryId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    } else if (image.imageUrl?.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", image.imageUrl);
        await unlink(filePath);
      } catch (err) {}
    }

    await JudgementImage.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
