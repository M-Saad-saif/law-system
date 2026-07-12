import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/api";
import User from "@/models/User";
import { getChamberForUser } from "@/lib/subscriptionService";

export const dynamic = "force-dynamic";

// GET - Returns branding config for the Branded Template, personalized to the
// logged-in lawyer's own name and their chamber's name (instead of a single
// hardcoded firm name shared by every user).
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const [dbUser, chamber] = await Promise.all([
      User.findById(user.id).lean(),
      getChamberForUser(user.id),
    ]);

    const lawyerName = dbUser?.name || user.name || "";
    const firmName = chamber?.name || (lawyerName ? `${lawyerName}'s Law Chamber` : "Law Chamber");

    const config = {
      firmName,
      lawyerName,
      tagline: "Advocates & Legal Consultants",
      subTagline: "Supreme Court of Pakistan | High Courts | Sessions Courts",
      email: dbUser?.email || user.email || "",
      website: "",
      barCouncilNo: dbUser?.barCouncilNo || "",
      logoUrl: dbUser?.profilePicture || "",
      primaryColor: "#171a2a",
      secondaryColor: "#026665",
    };

    return NextResponse.json({ success: true, data: { config } });
  } catch (error) {
    console.error("Fetch judgement image template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
