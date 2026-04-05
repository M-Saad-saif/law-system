"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import CaseForm from "@/components/cases/CaseForm";
import { PageLoader } from "@/components/ui";
import toast from "react-hot-toast";

export default function EditCasePage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/cases/${id}`)
      .then((d) => setCaseData(d.data.case))
      .catch(() => toast.error("Failed to load case."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="page-title">Edit Case</h1>
        <p className="page-subtitle">Update case information</p>
      </div>
      <CaseForm initialData={caseData} caseId={id} />
    </div>
  );
}
