import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { withClientAuth } from "@/lib/clientAuth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB

// POST /api/client-portal/cases/[id]/documents.
export const POST = withClientAuth(async (request, { params }, client) => {
  try {
    await connectDB();

    const caseDoc = await Case.findOne({
      _id: params.id,
      client: client.id,
      isSharedWithClient: true,
    });

    if (!caseDoc) {
      return NextResponse.json(
        { success: false, message: "Case not found." },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File must be under 15MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "client-evidence",
    );
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    caseDoc.documents.push({
      name: file.name,
      fileUrl: `/uploads/client-evidence/${filename}`,
      fileType: file.type,
      size: buffer.length,
      sharedWithClient: true,
      uploadedByClient: true,
      uploadedBy: client.id,
      uploadedByModel: "Client",
    });
    await caseDoc.save();

    const added = caseDoc.documents[caseDoc.documents.length - 1];
    return NextResponse.json(
      { success: true, data: { document: added } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[client-portal/cases/id/documents] POST:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload evidence file." },
      { status: 500 },
    );
  }
});
