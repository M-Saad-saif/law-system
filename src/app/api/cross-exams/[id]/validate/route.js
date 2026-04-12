import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import {
  validateWitnessSection,
  validateQAPair,
} from "@/lib/crossExamWorkflow";

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const witnesses = await WitnessSection.find({ crossExamId: params.id });

  const allErrors = [];
  const allWarnings = [];

  for (const witness of witnesses) {
    const wv = validateWitnessSection(witness);
    allErrors.push(...wv.errors);
    allWarnings.push(...wv.warnings);

    for (const pair of witness.qaPairs) {
      const pv = validateQAPair(pair);
      allErrors.push(
        ...pv.errors.map(
          (e) => `Q${pair.sequence} (${witness.witnessName}): ${e}`,
        ),
      );
      allWarnings.push(
        ...pv.warnings.map(
          (w) => `Q${pair.sequence} (${witness.witnessName}): ${w}`,
        ),
      );
    }
  }

  if (!exam.caseTheory) {
    allWarnings.push(
      "No case theory set. Define your overarching narrative before going to court.",
    );
  }
  if (!exam.overallObjective) {
    allWarnings.push(
      "No overall objective defined. What must this cross-examination achieve?",
    );
  }

  return NextResponse.json({
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    readyForSubmission: allErrors.length === 0,
  });
});
