// app/api/cross-exams/[id]/compare/route.js
// GET /api/cross-exams/:id/compare?versionA=1&versionB=2
// Returns a structured diff between two version snapshots.
// Each QA pair shows: unchanged | added | removed | modified fields.

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import connectDB from '@/lib/db';
import CrossExamination from '@/models/CrossExamination';

// ---------------------------------------------------------------------------
// Build a keyed map of QA pairs from a snapshot:
// { witnessId: { witnessName, qaPairs: { qaId: qaPairObject } } }
// ---------------------------------------------------------------------------
function buildWitnessMap(snapshot) {
  const map = {};
  for (const witness of snapshot || []) {
    const id = witness._id?.toString() || witness.id?.toString();
    map[id] = {
      witnessName: witness.witnessName,
      witnessType: witness.witnessType,
      role: witness.role,
      qaPairs: {},
    };
    for (const qa of witness.qaPairs || []) {
      const qId = qa._id?.toString() || qa.id?.toString();
      map[id].qaPairs[qId] = qa;
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Compare two QA pair objects and return a list of changed field names
// ---------------------------------------------------------------------------
const COMPARE_FIELDS = [
  'originalQuestion', 'originalAnswer',
  'editedQuestion',   'editedAnswer',
  'useEditedVersion', 'isFlagged', 'isApproved',
  'strategyNote',     'evidenceNote', 'caseLawNote',
];

function diffQaPair(a, b) {
  const changes = [];
  for (const field of COMPARE_FIELDS) {
    if (String(a[field] ?? '') !== String(b[field] ?? '')) {
      changes.push({ field, before: a[field], after: b[field] });
    }
  }
  return changes;
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const vA = parseInt(searchParams.get('versionA') || '0', 10);
  const vB = parseInt(searchParams.get('versionB') || '0', 10);

  if (!vA || !vB) {
    return NextResponse.json({ error: 'versionA and versionB query params are required.' }, { status: 400 });
  }

  const exam = await CrossExamination.findById(params.id).lean();
  if (!exam) return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });

  const isOwner    = exam.createdBy.toString() === user.id.toString();
  const isAssigned = exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  const isAdmin    = user.role === 'admin';
  if (!isOwner && !isAssigned && !isAdmin) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  const snapA = exam.versionHistory.find((v) => v.version === vA);
  const snapB = exam.versionHistory.find((v) => v.version === vB);

  if (!snapA) return NextResponse.json({ error: `Version ${vA} not found.` }, { status: 404 });
  if (!snapB) return NextResponse.json({ error: `Version ${vB} not found.` }, { status: 404 });

  const mapA = buildWitnessMap(snapA.snapshot);
  const mapB = buildWitnessMap(snapB.snapshot);

  const allWitnessIds = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
  const diffResult = [];

  for (const wId of allWitnessIds) {
    const wA = mapA[wId];
    const wB = mapB[wId];

    if (!wA) {
      // Witness added in version B
      diffResult.push({ witnessId: wId, witnessName: wB.witnessName, status: 'added', qaDiffs: [] });
      continue;
    }
    if (!wB) {
      // Witness removed in version B
      diffResult.push({ witnessId: wId, witnessName: wA.witnessName, status: 'removed', qaDiffs: [] });
      continue;
    }

    const allQaIds = new Set([...Object.keys(wA.qaPairs), ...Object.keys(wB.qaPairs)]);
    const qaDiffs  = [];

    for (const qaId of allQaIds) {
      const qaA = wA.qaPairs[qaId];
      const qaB = wB.qaPairs[qaId];

      if (!qaA) {
        qaDiffs.push({ qaId, sequence: qaB.sequence, status: 'added', changes: [] });
      } else if (!qaB) {
        qaDiffs.push({ qaId, sequence: qaA.sequence, status: 'removed', changes: [] });
      } else {
        const changes = diffQaPair(qaA, qaB);
        qaDiffs.push({
          qaId,
          sequence: qaB.sequence,
          status: changes.length > 0 ? 'modified' : 'unchanged',
          changes,
        });
      }
    }

    diffResult.push({
      witnessId: wId,
      witnessName: wB.witnessName,
      status: 'present',
      qaDiffs: qaDiffs.sort((a, b) => a.sequence - b.sequence),
    });
  }

  return NextResponse.json({
    versionA: { version: vA, message: snapA.message, createdAt: snapA.createdAt },
    versionB: { version: vB, message: snapB.message, createdAt: snapB.createdAt },
    diff: diffResult,
  });
});
