import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Case from "@/models/Case";
import { Reminder } from "@/models/BookReminder";
import { addDays, subDays } from "date-fns";
import { seedIntelligenceFeed } from "./intelligence-seed-snippet";

async function seedDemoData() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, message: "Seed not allowed in production." },
      { status: 403 },
    );
  }

  try {
    await connectDB();
    await seedIntelligenceFeed();

    await User.deleteMany({ email: "demo@LawPortal.com" });

    const user = await User.create({
      name: "Adv. Sanaullah Khan",
      email: "demo@LawPortal.com",
      password: "Demo@12345",
      role: "admin",
      phone: "+92-300-1234567",
      barCouncilNo: "LHC-2015-1234",
    });

    const today = new Date();
    const cases = await Case.insertMany([
      {
        userId: user._id,
        caseTitle: "State vs. Muhammad Ali",
        caseNumber: "CR-2024-001",
        courtType: "Sessions Court",
        courtName: "Additional Sessions Court No. 3, Lahore",
        caseType: "Criminal",
        counselFor: "Accused",
        clientName: "Muhammad Ali",
        clientContact: "+92-311-9876543",
        status: "Active",
        firNo: "245/2023",
        provisions: ["302 PPC", "34 PPC"],
        judgeName: "Hon. Judge Imran Butt",
        nextHearingDate: addDays(today, 0),
        nextProceedingDate: addDays(today, 3),
        filingDate: subDays(today, 120),
        oppositeCounsel: { name: "Adv. Raza Shah", contact: "+92-321-1111111" },
        proceedings: [
          {
            date: subDays(today, 30),
            notes: "Charge framing. Accused pleaded not guilty.",
            nextDate: subDays(today, 15),
          },
          {
            date: subDays(today, 15),
            notes:
              "Prosecution witness PW-1 examined. Cross-examination pending.",
            nextDate: today,
          },
        ],
      },
      {
        userId: user._id,
        caseTitle: "Khan vs. Ahmed Property Dispute",
        caseNumber: "CS-2023-087",
        courtType: "District Court",
        courtName: "Civil Court No. 1, Karachi",
        caseType: "Civil",
        counselFor: "Plaintiff",
        clientName: "Tariq Khan",
        clientContact: "+92-333-2222222",
        status: "Active",
        provisions: ["Specific Relief Act S.42", "CPC Order VII"],
        nextHearingDate: addDays(today, 1),
        filingDate: subDays(today, 200),
        oppositeCounsel: {
          name: "Adv. Farrukh Baig",
          contact: "+92-345-3333333",
        },
        proceedings: [
          {
            date: subDays(today, 60),
            notes: "Written statement filed by defendant.",
            nextDate: subDays(today, 30),
          },
          {
            date: subDays(today, 30),
            notes: "Issues framed. Plaintiff to lead evidence.",
            nextDate: addDays(today, 1),
          },
        ],
      },
      {
        userId: user._id,
        caseTitle: "Fatima vs. Zaid Divorce Petition",
        caseNumber: "FC-2024-032",
        courtType: "Family Court",
        courtName: "Family Court, Islamabad",
        caseType: "Family",
        counselFor: "Petitioner",
        clientName: "Fatima Bibi",
        clientContact: "+92-300-4444444",
        status: "Active",
        provisions: [
          "Muslim Family Laws Ordinance 1961",
          "Dissolution of Muslim Marriages Act 1939",
        ],
        nextHearingDate: addDays(today, 7),
        filingDate: subDays(today, 45),
      },
      {
        userId: user._id,
        caseTitle: "ABC Corp vs. Tax Authority",
        caseNumber: "TR-2023-015",
        courtType: "Tribunal",
        courtName: "Income Tax Appellate Tribunal, Karachi",
        caseType: "Tax",
        counselFor: "Appellant",
        clientName: "ABC Corporation",
        clientContact: "+92-21-1234567",
        status: "Pending",
        provisions: ["Income Tax Ordinance 2001 S.122", "ITO S.177"],
        nextHearingDate: addDays(today, 14),
        filingDate: subDays(today, 90),
      },
      {
        userId: user._id,
        caseTitle: "State vs. Rehman Bail Application",
        caseNumber: "BA-2024-201",
        courtType: "High Court",
        courtName: "Lahore High Court, Lahore",
        caseType: "Criminal",
        counselFor: "Accused",
        clientName: "Abdul Rehman",
        clientContact: "+92-321-5555555",
        status: "Closed",
        firNo: "89/2024",
        provisions: ["9(c) CNSA 1997"],
        filingDate: subDays(today, 150),
        proceedings: [
          {
            date: subDays(today, 20),
            notes: "Bail granted. Surety bonds submitted.",
            nextDate: null,
          },
        ],
      },
    ]);

    await Reminder.insertMany([
      {
        userId: user._id,
        title: "File Written Arguments — State vs. Ali",
        description:
          "Submit written arguments to the court before the next hearing.",
        dateTime: addDays(today, 2),
        priority: "high",
        linkedCase: cases[0]._id,
      },
      {
        userId: user._id,
        title: "Bar Council License Renewal",
        description: "Annual renewal of bar council license due this month.",
        dateTime: addDays(today, 10),
        priority: "medium",
      },
      {
        userId: user._id,
        title: "Client Meeting — Tariq Khan",
        description: "Discuss case strategy for property dispute.",
        dateTime: addDays(today, 1),
        priority: "high",
        linkedCase: cases[1]._id,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully.",
      credentials: { email: "demo@LawPortal.com", password: "Demo@12345" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST() {
  return seedDemoData();
}

export async function GET() {
  return seedDemoData();
}
