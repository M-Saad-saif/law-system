import CaseForm from '@/components/cases/CaseForm';
import { FilePlus2 } from 'lucide-react';

export const metadata = { title: 'New Case — LawPortal' };

export default function NewCasePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg,#026665,#0d8e83)' }}
        >
          <FilePlus2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">New Case</h1>
          <p className="page-subtitle">Fill in the details to register a new case in your practice</p>
        </div>
      </div>
      <CaseForm />
    </div>
  );
}