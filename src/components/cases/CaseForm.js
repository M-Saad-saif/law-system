"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { generateCaseNumber } from "@/utils/helpers";
import { Spinner } from "@/components/ui";
import { RefreshCw } from "lucide-react";

const COURT_TYPES = [
  "District Court",
  "High Court",
  "Supreme Court",
  "Tribunal",
  "Sessions Court",
  "Family Court",
  "Labour Court",
  "Anti-Corruption Court",
  "Special Court",
  "Other",
];
const CASE_TYPES = [
  "Civil",
  "Criminal",
  "Family",
  "Corporate",
  "Tax",
  "Constitutional",
  "Labour",
  "Banking",
  "Property",
  "Other",
];
const COUNSEL_FOR = [
  "Plaintiff",
  "Defendant",
  "Appellant",
  "Respondent",
  "Petitioner",
  "Accused",
  "Other",
];
const STATUSES = ["Active", "Pending", "Adjourned", "Closed", "Disposed"];

const defaultForm = {
  caseTitle: "",
  caseNumber: "",
  suitNo: "",
  courtType: "",
  courtName: "",
  phone: "",
  caseType: "",
  counselFor: "",
  filingDate: "",
  nextHearingDate: "",
  nextProceedingDate: "",
  status: "Active",
  judgeName: "",
  firNo: "",
  clientName: "",
  clientContact: "",
  provisions: "",
  oppositeCounselName: "",
  oppositeCounselContact: "",
};

function Field({
  label,
  type = "text",
  placeholder,
  required,
  children,
  value,
  onChange,
}) {
  return (
    <div className="form-group">
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children || (
        <input
          type={type}
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <Field label={label} required={required}>
      <select
        className="select"
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default function CaseForm({ initialData, caseId }) {
  const router = useRouter();
  const isEdit = !!caseId;

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...defaultForm,
        ...initialData,
        provisions: initialData.provisions?.join(", ") || "",
        oppositeCounselName: initialData.oppositeCounsel?.name || "",
        oppositeCounselContact: initialData.oppositeCounsel?.contact || "",
        filingDate: initialData.filingDate
          ? initialData.filingDate.split("T")[0]
          : "",
        nextHearingDate: initialData.nextHearingDate
          ? initialData.nextHearingDate.split("T")[0]
          : "",
        nextProceedingDate: initialData.nextProceedingDate
          ? initialData.nextProceedingDate.split("T")[0]
          : "",
      };
    }
    return defaultForm;
  });

  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.caseTitle ||
      !form.courtType ||
      !form.caseType ||
      !form.counselFor
    ) {
      return toast.error("Please fill all required fields.");
    }

    setLoading(true);
    const payload = {
      ...form,
      provisions: form.provisions
        ? form.provisions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      oppositeCounsel: {
        name: form.oppositeCounselName,
        contact: form.oppositeCounselContact,
      },
    };
    delete payload.oppositeCounselName;
    delete payload.oppositeCounselContact;

    try {
      if (isEdit) {
        await api.put(`/api/cases/${caseId}`, payload);
        toast.success("Case updated successfully.");
        router.push(`/cases/${caseId}`);
      } else {
        const res = await api.post("/api/cases", payload);
        toast.success("Case created successfully.");
        router.push(`/cases/${res.data.case._id}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card p-5">
        <h3 className="section-title">Case Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field
              label="Case Title"
              placeholder="e.g. State vs. Muhammad Ali"
              required
              value={form.caseTitle}
              onChange={set("caseTitle")}
            />
          </div>

          <Field label="Case Number">
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="e.g. CR-2024-001"
                value={form.caseNumber}
                onChange={set("caseNumber")}
              />
              <button
                type="button"
                title="Auto-generate"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    caseNumber: generateCaseNumber("CASE"),
                  }))
                }
                className="btn-secondary px-2.5 shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </Field>

          <Field
            label="Suit / File No."
            placeholder="Optional"
            value={form.suitNo}
            onChange={set("suitNo")}
          />
          <Select
            label="Court Type"
            options={COURT_TYPES}
            required
            value={form.courtType}
            onChange={set("courtType")}
          />
          <Field
            label="Court Name"
            placeholder="e.g. District Court, Lahore"
            value={form.courtName}
            onChange={set("courtName")}
          />
          <Select
            label="Case Type"
            options={CASE_TYPES}
            required
            value={form.caseType}
            onChange={set("caseType")}
          />
          <Select
            label="Counsel For"
            options={COUNSEL_FOR}
            required
            value={form.counselFor}
            onChange={set("counselFor")}
          />
          <Select
            label="Status"
            options={STATUSES}
            required
            value={form.status}
            onChange={set("status")}
          />
        </div>
      </div>

      {/* Client Info */}
      <div className="card p-5">
        <h3 className="section-title">Client & Party Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Client Name"
            placeholder="Full name of client"
            value={form.clientName}
            onChange={set("clientName")}
          />
          <Field
            label="Client Contact"
            placeholder="+92-300-0000000"
            value={form.clientContact}
            onChange={set("clientContact")}
          />
          <Field
            label="Opposite Counsel"
            placeholder="Opposing advocate name"
            value={form.oppositeCounselName}
            onChange={set("oppositeCounselName")}
          />
          <Field
            label="Opposite Counsel Contact"
            placeholder="Phone / email"
            value={form.oppositeCounselContact}
            onChange={set("oppositeCounselContact")}
          />
          <Field
            label="Phone (Case)"
            placeholder="Case-specific contact number"
            value={form.phone}
            onChange={set("phone")}
          />
          <Field
            label="FIR No. (Criminal)"
            placeholder="e.g. 245/2023"
            value={form.firNo}
            onChange={set("firNo")}
          />
        </div>
      </div>

      {/* Legal Details */}
      <div className="card p-5">
        <h3 className="section-title">Legal & Schedule Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Judge Name"
            placeholder="Presiding judge (optional)"
            value={form.judgeName}
            onChange={set("judgeName")}
          />
          <Field
            label="Filing Date"
            type="date"
            value={form.filingDate}
            onChange={set("filingDate")}
          />
          <Field
            label="Next Hearing Date"
            type="date"
            value={form.nextHearingDate}
            onChange={set("nextHearingDate")}
          />
          <Field
            label="Next Proceeding Date"
            type="date"
            value={form.nextProceedingDate}
            onChange={set("nextProceedingDate")}
          />
          <div className="sm:col-span-2">
            <Field label="Provisions / Legal Sections">
              <input
                type="text"
                className="input"
                placeholder="e.g. 302 PPC, 34 PPC, Section 9(c) CNSA (comma-separated)"
                value={form.provisions}
                onChange={set("provisions")}
              />
              <p className="text-xs text-slate-400 mt-1">
                Separate multiple sections with commas
              </p>
            </Field>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-w-[120px]"
        >
          {loading ? (
            <Spinner size="sm" className="text-white" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Case"
          )}
        </button>
      </div>
    </form>
  );
}
