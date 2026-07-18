import React from "react";

import {
  User,
  Scale,
  Calendar,
  Hash,
  Phone,
  Gavel,
  Clock,
  Users,
  Shield,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/utils/helpers";


const OverviewTab = ({ c }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Case Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6">
            {/* Header - Perfectly aligned */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Case Details</h3>
              <span className="ml-auto px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-200 flex-shrink-0">
                {c.status || "Active"}
              </span>
            </div>

            {/* Grid - Perfectly aligned rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Case Type
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.caseType}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gavel className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Court
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {[c.courtType, c.courtName].filter(Boolean).join(" — ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hash className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Case Number
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.caseNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hash className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Suit / File No.
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.suitNo}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hash className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    FIR No.
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.firNo}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Counsel For
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.counselFor}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Judge
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.judgeName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Filing Date
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {formatDate(c.filingDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Provisions */}
        {c.provisions?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Legal Provisions
                </h3>
                <span className="ml-auto px-3 py-1 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full border border-amber-200 flex-shrink-0">
                  {c.provisions.length} section
                  {c.provisions.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.provisions.map((p, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-semibold border border-amber-200/60 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Right Column */}
      <div className="space-y-6 contents">
        {/* Client Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Client</h3>
              {c.isSharedWithClient && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200 flex-shrink-0">
                  Portal Access
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.clientName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Contact
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.clientContact}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Case Phone
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Portal Access Card */}
        {c.isSharedWithClient && c.client && (
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#026665] to-[#0d8e83] flex items-center justify-center shadow-lg shadow-[#026665]/20 flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Portal Access
                </h3>
                <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-100 rounded-full border border-emerald-300 flex-shrink-0">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Granted To
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {c.client.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {c.client.email}
                    </p>
                  </div>
                </div>

                {c.client.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Contact
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {c.client.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Opposite Counsel Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Opposite Counsel
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.oppositeCounsel?.name || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Contact
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.oppositeCounsel?.contact || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Schedule</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Next Hearing
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(c.nextHearingDate) || "Not scheduled"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Next Proceeding
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(c.nextProceedingDate) || "Not scheduled"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Last Updated
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDateTime(c.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
