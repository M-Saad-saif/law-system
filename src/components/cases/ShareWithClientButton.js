"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { Users, X, Copy, Check, Mail, Phone, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui";

export default function ShareWithClientButton({
  caseId,
  isSharedWithClient,
  client,
  onAccessChanged,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const hasActiveAccess = Boolean(isSharedWithClient && client?.email);

  const reset = () => {
    setForm({ clientName: "", clientEmail: "", clientPhone: "" });
    setResult(null);
    setCopied(false);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Client-side guard: don't even attempt to re-grant access to the
    // same account that already has access to this case.
    if (
      hasActiveAccess &&
      form.clientEmail.trim().toLowerCase() === client.email.toLowerCase()
    ) {
      toast.error("This client already has access to this case.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/api/cases/${caseId}/client-access`, {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        isSharedWithClient: true,
      });
      setResult(res.data);
      toast.success("Client portal access granted.");
      onAccessChanged?.({
        isSharedWithClient: true,
        client: res.data.client,
      });
    } catch (err) {
      toast.error(err.message || "Failed to grant client access.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.delete(`/api/cases/${caseId}/client-access`);
      toast.success("Client portal access revoked for this case.");
      onAccessChanged?.({ isSharedWithClient: false });
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err.message || "Failed to revoke client access.");
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = () => {
    if (!result) return;
    const text = `Portal: ${window.location.origin}/portal/login\nEmail: ${result.client.email}\nPassword: ${result.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#0d8e83]/30 text-[#026665] rounded-lg text-sm font-medium hover:bg-[#ccebdb] transition-all duration-200 shadow-sm"
      >
        <Users className="w-4 h-4" />
        {hasActiveAccess ? "Manage Client Access" : "Share with Client"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="absolute top-4 right-4 text-[#1c3d3b]/40 hover:text-[#1c3d3b]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-[#1c3d3b] mb-1">
              Client Portal Access
            </h2>

            {!result ? (
              <>
                {hasActiveAccess ? (
                  <div className="mb-5">
                    <p className="text-sm text-[#1c3d3b]/60 mb-3">
                      This case is currently shared with:
                    </p>
                    <div className="bg-[#ccebdb]/40 rounded-lg p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1c3d3b]">
                        <ShieldCheck className="w-4 h-4 text-[#026665]" />
                        {client.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#1c3d3b]/80">
                        <Mail className="w-3.5 h-3.5 text-[#1c3d3b]/50" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-[#1c3d3b]/80">
                          <Phone className="w-3.5 h-3.5 text-[#1c3d3b]/50" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#1c3d3b]/50 mt-2">
                      To share this case with a different client, revoke this
                      account's access first.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#1c3d3b]/60 mb-5">
                    Give this case's client a login to their own portal. If the
                    email already has a client account, it'll just be linked to
                    this case.
                  </p>
                )}

                {!hasActiveAccess && (
                  <form onSubmit={handleShare} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1c3d3b]/70 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.clientName}
                        onChange={(e) =>
                          setForm({ ...form, clientName: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#ccebdb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d8e83]"
                        placeholder="e.g. Ali Raza"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1c3d3b]/70 mb-1">
                        Client Email
                      </label>
                      <input
                        type="email"
                        required
                        value={form.clientEmail}
                        onChange={(e) =>
                          setForm({ ...form, clientEmail: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#ccebdb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d8e83]"
                        placeholder="client@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1c3d3b]/70 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={form.clientPhone}
                        onChange={(e) =>
                          setForm({ ...form, clientPhone: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#ccebdb] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d8e83]"
                        placeholder="e.g. 0300-1234567"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#026665] hover:bg-[#0d8e83] text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <Spinner size="sm" /> : "Grant Access"}
                    </button>
                  </form>
                )}

                {hasActiveAccess && (
                  <button
                    onClick={handleRevoke}
                    disabled={loading}
                    className="w-full mt-1 text-xs text-red-600 hover:text-red-700 py-1.5 border border-red-200 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      "Revoke client access to this case"
                    )}
                  </button>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-[#1c3d3b]/70 mb-4">
                  Access granted. Share these details with your client — this
                  password is only shown once.
                </p>
                <div className="bg-[#ccebdb]/40 rounded-lg p-4 space-y-1 text-sm font-mono">
                  <div>
                    Portal:{" "}
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /portal/login
                  </div>
                  <div>Email: {result.client.email}</div>
                  {result.temporaryPassword && (
                    <div>Password: {result.temporaryPassword}</div>
                  )}
                  {!result.temporaryPassword && (
                    <div className="text-xs text-[#1c3d3b]/50 font-sans mt-1">
                      This client already had an account — their existing
                      password still works.
                    </div>
                  )}
                </div>
                {result.temporaryPassword && (
                  <button
                    onClick={copyCreds}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-sm text-[#026665] hover:text-[#0d8e83] py-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy credentials
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                  className="w-full mt-2 bg-[#026665] hover:bg-[#0d8e83] text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
