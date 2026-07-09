import CaseForm from "@/components/cases/CaseForm";
import { FilePlus2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Case — LawPortal" };

export default function NewCasePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6  rounded-[12px] bg-[#eef5f3] p-5">
      <div className="page-header flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg,#026665,#0d8e83)" }}
        >
          <FilePlus2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">New Case</h1>
          <p className="page-subtitle">
            Fill in the details to register a new case in your practice
          </p>

          <Link
            href="/cases"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#026665] hover:text-[#024a4a] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to cases
          </Link>
        </div>
      </div>
      <CaseForm />
    </div>
  );
}
