import CaseForm from '@/components/cases/CaseForm';

export const metadata = { title: 'New Case — LexisPortal' };

export default function NewCasePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="page-title">New Case</h1>
        <p className="page-subtitle">Fill in the details to register a new case in your practice</p>
      </div>
      <CaseForm />
    </div>
  );
}
