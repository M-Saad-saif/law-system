"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import {
  PageLoader,
  EmptyState,
  SearchInput,
  Modal,
  ConfirmDialog,
} from "@/components/ui";
import {
  Star,
  StarOff,
  Bookmark,
  Tag,
  Trash2,
  Eye,
  Plus,
  StickyNote,
  Trophy,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Scale,
   ChevronUp,
  ChevronDown,
  Gavel,
  Download,
  Share2,
  Link as LinkIcon,
  Copy,
  Sparkles,
  Search,
  SlidersHorizontal,
  BookOpen,
  Calendar,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Zap,
  Layers,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const COURTS = [
  "",
  "Supreme Court of Pakistan",
  "Lahore High Court",
  "Sindh High Court",
  "Peshawar High Court",
  "Balochistan High Court",
  "Islamabad High Court",
  "Sessions Court",
  "Special Court",
];

export default function LibraryPage() {
  const [mainTab, setMainTab] = useState("judgements");
  const [entries, setEntries] = useState([]);
  const [tags, setTags] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterCourt, setFilterCourt] = useState("");
  const [filterImportant, setFilterImportant] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleExport = async (mode = "all") => {
    try {
      const url =
        mode === "all"
          ? "/api/library/export?ids=all"
          : `/api/library/export?ids=${entries.map((e) => e._id).join(",")}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = "judgement-library.json";
      a.click();
      toast.success("Export started.");
    } catch {
      toast.error("Export failed.");
    }
  };

  const [savedCases, setSavedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [caseSearch, setCaseSearch] = useState("");

  const fetchSavedCases = useCallback(async () => {
    setCasesLoading(true);
    try {
      const params = new URLSearchParams({ isFavourite: "true", limit: 100 });
      if (caseSearch) params.set("search", caseSearch);
      const response = await api.get(`/api/cases?${params}`);
      setSavedCases(response?.data?.cases || []);
    } catch {
      toast.error("Failed to load saved cases.");
    } finally {
      setCasesLoading(false);
    }
  }, [caseSearch]);

  useEffect(() => {
    if (mainTab === "cases") {
      const t = setTimeout(fetchSavedCases, caseSearch ? 400 : 0);
      return () => clearTimeout(t);
    }
  }, [mainTab, fetchSavedCases, caseSearch]);

  const removeCaseFromLibrary = async (c) => {
    try {
      await api.patch(`/api/cases/${c._id}/favourite`);
      setSavedCases((prev) => prev.filter((x) => x._id !== c._id));
      toast.success("Removed from Library.");
    } catch {
      toast.error("Failed to remove.");
    }
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set("search", search);
      if (filterTag) params.set("tag", filterTag);
      if (filterCourt) params.set("courtName", filterCourt);
      if (filterImportant) params.set("isMostImportant", "true");
      const response = await api.get(`/api/library?${params}`);
      setEntries(response?.data?.entries || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
      setTags(response?.data?.tags || []);
    } catch {
      toast.error("Failed to load library.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterTag, filterCourt, filterImportant]);

  useEffect(() => {
    const t = setTimeout(fetchEntries, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchEntries, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterTag, filterCourt, filterImportant]);

  const toggleFlag = async (entry, field) => {
    try {
      await api.put(`/api/library/${entry._id}`, { [field]: !entry[field] });
      setEntries((prev) =>
        prev.map((e) =>
          e._id === entry._id ? { ...e, [field]: !e[field] } : e,
        ),
      );
      toast.success(
        field === "isMostImportant"
          ? !entry[field]
            ? "Marked as Most Important"
            : "Removed from Most Important"
          : !entry[field]
            ? "Added to Favourites"
            : "Removed from Favourites",
      );
    } catch {
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/library/${deleteTarget._id}`);
      toast.success("Entry removed from library.");
      setDeleteTarget(null);
      fetchEntries();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterTag("");
    setFilterCourt("");
    setFilterImportant(false);
  };

  const hasFilters = filterTag || filterCourt || filterImportant;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#eef5f3]">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/30 -z-10" />

      {/* Header with Glass Effect */}
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative backdrop-blur-sm bg-white/80 rounded-2xl p-6 shadow-lg border border-slate-200/60 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/20 animate-float">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Library
                </h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  {mainTab === "judgements"
                    ? `${total} saved judgement${total !== 1 ? "s" : ""}`
                    : `${savedCases.length} saved case${savedCases.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            {mainTab === "judgements" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport("all")}
                  className="group relative px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:shadow-md overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Export
                  </span>
                </button>
                <button
                  onClick={() => setAddOpen(true)}
                  className="group relative px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Judgement
                  </span>
                </button>
              </div>
            )}
            {mainTab === "cases" && (
              <Link
                href="/cases"
                className="group relative px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Manage Cases
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Tab Switcher */}
      <div className="flex gap-1 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit shadow-inner">
        <button
          onClick={() => setMainTab("judgements")}
          className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            mainTab === "judgements"
              ? "bg-white text-slate-800 shadow-lg shadow-slate-200/50 scale-105"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          }`}
        >
          <span className="flex items-center gap-2">
            <Trophy
              className={`w-4 h-4 transition-all duration-300 ${mainTab === "judgements" ? "text-amber-500 rotate-0" : "rotate-12"}`}
            />
            Judgements
          </span>
        </button>
        <button
          onClick={() => setMainTab("cases")}
          className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            mainTab === "cases"
              ? "bg-white text-slate-800 shadow-lg shadow-slate-200/50 scale-105"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          }`}
        >
          <span className="flex items-center gap-2">
            <Star
              className={`w-4 h-4 transition-all duration-300 ${mainTab === "cases" ? "text-yellow-400 fill-yellow-400 scale-110" : ""}`}
            />
            Saved Cases
            {savedCases.length > 0 && (
              <span className="relative ml-1.5">
                <span className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />
                <span className="relative bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedCases.length}
                </span>
              </span>
            )}
          </span>
        </button>
      </div>

      {/* ----- SAVED CASES TAB ----- */}
      {mainTab === "cases" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <SearchInput
              value={caseSearch}
              onChange={setCaseSearch}
              placeholder="Search saved cases..."
              className="max-w-md pl-10"
            />
          </div>
          {casesLoading ? (
            <PageLoader />
          ) : savedCases.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No saved cases yet"
              description="Star any case from the Cases page or case detail view to save it here."
              action={
                <Link href="/cases" className="btn-primary">
                  <FolderOpen className="w-4 h-4" /> Browse Cases
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
              {savedCases.map((c) => (
                <div key={c._id} className="animate-slideUp">
                  <SavedCaseCard
                    c={c}
                    onRemove={() => removeCaseFromLibrary(c)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----- JUDGEMENTS TAB ----- */}
      {mainTab === "judgements" && (
        <div className="animate-fadeIn">
          {/* Enhanced Most Important Banner */}
          {!filterImportant && (
            <button
              onClick={() => setFilterImportant(true)}
              className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200/60 text-amber-800 text-sm font-medium hover:border-amber-300 hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-md animate-pulse" />
                <div className="relative p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-amber-900">
                  Most Important Judgements
                </p>
                <p className="text-xs text-amber-600/80">
                  Click to view your curated collection of landmark decisions
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          )}

          {/* Enhanced Search + Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-all duration-300" />
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by title, citation, offence, tags..."
                  className="flex-1 pl-10 pr-4 py-3 border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 rounded-xl"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
                  showFilters || hasFilters
                    ? "bg-primary-50 border-primary-300 text-primary-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {hasFilters && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Expandable Filters */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-all duration-500 ease-in-out ${
                showFilters
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <select
                value={filterCourt}
                onChange={(e) => setFilterCourt(e.target.value)}
                className="select w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
              >
                <option value="">All Courts</option>
                {COURTS.filter(Boolean).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {tags.length > 0 && (
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="select w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                >
                  <option value="">All Tags</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-md"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Active Filter Pills */}
          {filterImportant && (
            <div className="flex items-center gap-2 animate-slideIn">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-xs font-semibold border border-amber-200 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Most Important
                <button
                  onClick={() => setFilterImportant(false)}
                  className="ml-1 p-0.5 hover:bg-amber-200 rounded-full transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Enhanced Grid with Animations */}
          {loading ? (
            <div className="animate-fadeIn">
              <PageLoader />
            </div>
          ) : entries.length === 0 ? (
            <div className="animate-fadeIn">
              <EmptyState
                icon={Bookmark}
                title="No judgements in library"
                description="Save important judgements here for quick access, tagging, and annotations."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
                {entries.map((entry, index) => (
                  <div
                    key={entry._id}
                    className="animate-slideUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onMouseEnter={() => setHoveredCard(entry._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <LibraryCard
                      entry={entry}
                      onView={() => setViewEntry(entry)}
                      onToggleFavourite={() => toggleFlag(entry, "isFavourite")}
                      onToggleImportant={() =>
                        toggleFlag(entry, "isMostImportant")
                      }
                      onDelete={() => setDeleteTarget(entry)}
                      isHovered={hoveredCard === entry._id}
                    />
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 animate-fadeIn">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="group p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:shadow-none transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors duration-300" />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            page === pageNum
                              ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 scale-110"
                              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-primary-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="group p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:shadow-none transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors duration-300" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          {viewEntry && (
            <EntryDetailModal
              entry={viewEntry}
              onClose={() => setViewEntry(null)}
              onUpdated={(updated) => {
                setViewEntry(updated);
                setEntries((prev) =>
                  prev.map((e) => (e._id === updated._id ? { ...updated } : e)),
                );
              }}
            />
          )}

          {addOpen && (
            <AddEntryModal
              onClose={() => setAddOpen(false)}
              onAdded={() => {
                setAddOpen(false);
                fetchEntries();
              }}
            />
          )}

          <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            title="Remove from Library"
            message={`Remove "${deleteTarget?.title}" from your library? This cannot be undone.`}
            confirmLabel="Remove"
            loading={deleting}
          />
        </div>
      )}

      {/* Add custom animations to global styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .stagger-children > *:nth-child(1) {
          animation-delay: 0ms;
        }
        .stagger-children > *:nth-child(2) {
          animation-delay: 100ms;
        }
        .stagger-children > *:nth-child(3) {
          animation-delay: 200ms;
        }
        .stagger-children > *:nth-child(4) {
          animation-delay: 300ms;
        }
        .stagger-children > *:nth-child(5) {
          animation-delay: 400ms;
        }
        .stagger-children > *:nth-child(6) {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

// ----- Enhanced Saved Case Card -----

function SavedCaseCard({ c, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Adjourned: "bg-orange-100 text-orange-700 border-orange-200",
    Disposed: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-lg hover:shadow-2xl transition-all duration-500 border border-yellow-200/60 hover:border-yellow-300 overflow-hidden"
    >
      {/* Animated Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-yellow-300/0 to-amber-400/0 transition-all duration-700 ${
          isHovered ? "from-yellow-400/5 via-yellow-300/5 to-amber-400/5" : ""
        }`}
      />

      {/* Floating stars on hover */}
      {isHovered && (
        <>
          <div
            className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="absolute top-8 right-8 w-1.5 h-1.5 bg-amber-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ animationDelay: "200ms" }}
          />
        </>
      )}

      <div className="relative">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-mono mb-1 truncate group-hover:text-slate-500 transition-colors duration-300">
              {c.caseNumber || c.suitNo || "—"}
            </p>
            <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors duration-300">
              {c.caseTitle}
            </h3>
          </div>
          <div className="relative">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm animate-pulse opacity-50" />
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-1.5 text-xs mt-3">
          <span
            className={`px-2.5 py-1 rounded-full font-semibold border transition-all duration-300 group-hover:shadow-sm ${
              statusColors[c.status] ||
              "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {c.status}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-200">
            {c.caseType}
          </span>
        </div>

        {/* Court */}
        {(c.courtType || c.courtName) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 group-hover:text-slate-600 transition-colors duration-300">
            <Gavel className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {[c.courtType, c.courtName].filter(Boolean).join(" — ")}
            </span>
          </div>
        )}

        {/* Client */}
        {c.clientName && (
          <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600 transition-colors duration-300">
            Client: {c.clientName}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-3 mt-2 border-t border-slate-100 group-hover:border-slate-200 transition-colors duration-300">
          <Link
            href={`/cases/${c._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-primary-50 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-600 transition-all duration-300 group/link"
          >
            <Eye className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform duration-300" />
            Open Case
          </Link>
          <button
            onClick={onRemove}
            title="Remove from Library"
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 hover:scale-110"
          >
            <StarOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Enhanced Library Card ─────────────────────────────────────────────────────────────

function LibraryCard({
  entry,
  onView,
  onToggleFavourite,
  onToggleImportant,
  onDelete,
  isHovered,
}) {
  const pdfLink = entry.pdfUrl || entry.sourceUrl;
  const summaryText = entry.voiceSummary || entry.rawText || "";
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  
  // Generate a gradient based on importance and court
  const getCardGradient = () => {
    if (entry.isMostImportant) {
      return "from-amber-50 via-yellow-50 to-amber-50/30";
    }
    if (entry.isFavourite) {
      return "from-rose-50 via-pink-50 to-rose-50/30";
    }
    return "from-slate-50 via-white to-slate-50/30";
  };

  // Get accent color based on importance
  const getAccentColor = () => {
    if (entry.isMostImportant) return "amber";
    if (entry.isFavourite) return "rose";
    return "primary";
  };

  const accent = getAccentColor();
  
  // Court badge color
  const getCourtBadgeColor = (court) => {
    if (!court) return "slate";
    if (court.includes("Supreme Court")) return "purple";
    if (court.includes("High Court")) return "blue";
    if (court.includes("Sessions")) return "green";
    if (court.includes("Special")) return "orange";
    return "slate";
  };

  const courtColor = getCourtBadgeColor(entry.courtName);

  const badgeColors = {
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    primary: "bg-primary-100 text-primary-700 border-primary-200",
  };

  // Determine if summary is long enough to need truncation
  const needsTruncation = summaryText.length > 150;
  const displaySummary = showFullSummary ? summaryText : summaryText.slice(0, 150);

  // Toggle summary expansion
  const toggleSummary = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullSummary(!showFullSummary);
  };

  return (
    <div
      className={`group relative bg-gradient-to-br ${getCardGradient()} rounded-2xl p-6 flex flex-col gap-3 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border ${
        entry.isMostImportant
          ? "border-amber-300/60 ring-2 ring-amber-400/30"
          : entry.isFavourite
          ? "border-rose-300/40"
          : "border-slate-200/60"
      } ${isHovered ? "scale-[1.02] translate-y-[-6px] shadow-2xl" : ""}`}
    >
      {/* Premium Glow Effect - Enhanced */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-20 -right-20 w-60 h-60 bg-${accent}-400/5 rounded-full blur-3xl transition-all duration-700 ${isHovered ? "scale-150 opacity-100" : "opacity-0"}`} />
        <div className={`absolute -bottom-20 -left-20 w-60 h-60 bg-${accent}-400/5 rounded-full blur-3xl transition-all duration-700 ${isHovered ? "scale-150 opacity-100" : "opacity-0"}`} style={{ transitionDelay: "100ms" }} />
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000 ${isHovered ? "translate-x-full" : ""}`} />
      </div>

      {/* Premium Badge for Important */}
      {entry.isMostImportant && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-md animate-ping opacity-60" />
            <div className="relative bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
              <Trophy className="w-3 h-3" />
              Landmark
            </div>
          </div>
        </div>
      )}

      {/* Top Row - Enhanced */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Citation with Premium Style */}
          {entry.citation && (
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-400 rounded-full" />
              <p className="text-[11px] font-mono font-bold text-primary-700 bg-primary-50/80 px-3 py-1 rounded-full border border-primary-200/60 backdrop-blur-sm">
                {entry.citation}
              </p>
            </div>
          )}

          {/* Title with Gradient on Hover */}
          <h3 className={`font-bold text-slate-800 text-sm leading-snug line-clamp-2 transition-all duration-300 ${
            isHovered ? "text-slate-900" : ""
          }`}>
            {entry.title}
          </h3>
        </div>

        {/* Quick Action Buttons - Premium Style */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleImportant?.();
            }}
            title={entry.isMostImportant ? "Remove landmark status" : "Mark as Landmark"}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              entry.isMostImportant
                ? "bg-amber-50 text-amber-500 shadow-sm shadow-amber-500/20"
                : "text-slate-300 hover:text-amber-500 hover:bg-amber-50/50"
            }`}
          >
            <Trophy className={`w-4 h-4 transition-transform duration-300 ${entry.isMostImportant ? "scale-110" : ""}`} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavourite?.();
            }}
            title={entry.isFavourite ? "Remove favourite" : "Mark favourite"}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              entry.isFavourite
                ? "bg-rose-50 text-rose-500 shadow-sm shadow-rose-500/20"
                : "text-slate-300 hover:text-rose-500 hover:bg-rose-50/50"
            }`}
          >
            {entry.isFavourite ? (
              <Star className="w-4 h-4 fill-rose-400" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Court & Date - Enhanced Badge */}
      <div className="relative flex flex-wrap items-center gap-2">
        {entry.courtName && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${badgeColors[courtColor] || badgeColors.slate} transition-all duration-300 group-hover:shadow-sm`}>
            <Scale className="w-3 h-3" />
            {entry.courtName}
          </span>
        )}
        {entry.judgementDate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-slate-500 bg-slate-50/80 border border-slate-200/60 backdrop-blur-sm">
            <Calendar className="w-3 h-3" />
            {new Date(entry.judgementDate).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
        {entry.offenceName && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-slate-600 bg-slate-50/80 border border-slate-200/60 backdrop-blur-sm">
            <Gavel className="w-3 h-3" />
            {entry.offenceName}
          </span>
        )}
      </div>

      {/* Final Decision - Enhanced with Style */}
      {entry.finalDecision && (
        <div className="relative mt-1">
          <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-slate-50/80 to-white/50 rounded-xl border border-slate-200/60 backdrop-blur-sm transition-all duration-300 group-hover:border-slate-300/80 group-hover:shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {entry.finalDecision}
            </p>
          </div>
        </div>
      )}

      {/* Summary - Enhanced with Dropdown/Expandable Feature */}
      {summaryText && (
        <div className="relative mt-1">
          <div className="p-3 bg-gradient-to-r from-primary-50/50 to-blue-50/50 rounded-xl border border-primary-200/40 backdrop-blur-sm transition-all duration-300 group-hover:border-primary-300/60 group-hover:shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs text-slate-600 leading-relaxed transition-all duration-300 ${
                    !showFullSummary && needsTruncation ? "line-clamp-3" : ""
                  }`}>
                    {summaryText}
                  </p>
                </div>
              </div>
              
              {/* Expand/Collapse Button - Only show if text is long enough */}
              {needsTruncation && (
                <button
                  onClick={toggleSummary}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-all duration-300 hover:scale-105 mt-1 pt-1 border-t border-primary-200/40"
                >
                  {showFullSummary ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Read Full Summary
                      <span className="text-[10px] text-primary-400">({summaryText.length} chars)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Laws Discussed - Optional */}
      {entry.lawsDiscussed && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50/80 rounded-lg px-3 py-1.5 border border-slate-200/60 transition-all duration-300 group-hover:border-slate-300/80">
          <BookOpen className="w-3 h-3 text-primary-400" />
          <span className="font-medium">Laws:</span>
          <span className="line-clamp-1">{entry.lawsDiscussed}</span>
        </div>
      )}

      {/* Tags - Premium Style */}
      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="group/tag inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-primary-700 text-[10px] font-semibold border border-primary-200/60 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300 cursor-default hover:scale-105"
            >
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {tag}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200">
              +{entry.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* PDF Link - Enhanced Button */}
      {pdfLink && (
        <a
          href={pdfLink}
          target="_blank"
          rel="noreferrer"
          className="group/link inline-flex items-center justify-center gap-2 text-xs font-semibold text-primary-700 bg-primary-50/80 border border-primary-200/60 rounded-xl px-4 py-2.5 transition-all duration-300 hover:bg-primary-100 hover:border-primary-300 hover:shadow-md hover:scale-[1.02]"
        >
          <Download className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:scale-110" />
          View Full PDF
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      )}

      {/* Actions - Enhanced Footer */}
      <div className="flex items-center gap-1 pt-3 mt-1 border-t border-slate-200/60 group-hover:border-slate-300/80 transition-all duration-300">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView?.();
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-slate-50 to-white hover:from-primary-50 hover:to-primary-50/50 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-600 transition-all duration-300 border border-slate-200/60 hover:border-primary-300 hover:shadow-md hover:scale-[1.02] group/btn"
        >
          <Eye className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:scale-110" />
          View Details
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.();
          }}
          className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300 hover:scale-110 border border-transparent hover:border-red-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Entry Detail Modal ────────────────────────────────────────────────────────

function EntryDetailModal({ entry, onClose, onUpdated }) {
  const [data, setData] = useState(entry);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editTags, setEditTags] = useState(false);
  const [tagInput, setTagInput] = useState((entry.tags || []).join(", "));

  const SECTIONS = [
    { key: "offenceName", label: "Offence Name", icon: BookOpen },
    { key: "courtName", label: "Court", icon: Gavel },
    { key: "lawsDiscussed", label: "Laws Discussed", icon: Scale },
    {
      key: "crossExaminationQuestions",
      label: "Cross-Examination Questions",
      icon: Zap,
    },
    {
      key: "courtExaminationOfEvidence",
      label: "Court Examination of Evidence",
      icon: Search,
    },
    { key: "finalDecision", label: "Final Decision", icon: CheckCircle2 },
    { key: "voiceSummary", label: "Comprehensive Summary", icon: Sparkles },
  ];

  const [shareUrl, setShareUrl] = useState(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await api.post(`/api/library/share`, { entryId: data._id });
      const url = `${window.location.origin}${res?.data?.shareUrl}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to create share link.");
    } finally {
      setSharing(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/api/library/${data._id}/notes`, {
        content: noteText,
      });
      const updated = { ...data, notes: res.data.notes };
      setData(updated);
      onUpdated(updated);
      setNoteText("");
      toast.success("Note added.");
    } catch {
      toast.error("Failed to add note.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const res = await api.delete(
        `/api/library/${data._id}/notes?noteId=${noteId}`,
      );
      const updated = { ...data, notes: res.data.notes };
      setData(updated);
      onUpdated(updated);
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  const saveTags = async () => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await api.put(`/api/library/${data._id}`, { tags });
      const updated = { ...data, tags: res.data.entry.tags };
      setData(updated);
      onUpdated(updated);
      setEditTags(false);
      toast.success("Tags updated.");
    } catch {
      toast.error("Failed to update tags.");
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={data.title} size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
        {/* Citation + meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200">
          <div className="flex flex-wrap gap-3">
            {data.citation && (
              <span className="font-mono text-teal-700 bg-teal-50 px-3 py-1 rounded-lg font-bold border border-teal-200 shadow-sm">
                {data.citation}
              </span>
            )}
            {data.judgementDate && (
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(data.judgementDate).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {(data.pdfUrl || data.sourceUrl) && (
              <a
                href={data.pdfUrl || data.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#026a69] hover:text-[#0e8e83] bg-slate-50 border border-slate-200 rounded-full px-3 py-1 transition-all duration-300 hover:bg-slate-100"
              >
                <Download className="w-3.5 h-3.5" />
                Open PDF
              </a>
            )}
          </div>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50"
          >
            {sharing ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Share2 className="w-3 h-3" />
            )}
            {sharing ? "Sharing..." : "Share"}
          </button>
        </div>

        {shareUrl && (
          <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-200 animate-slideIn">
            <LinkIcon className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs text-teal-700 font-mono flex-1 truncate">
              {shareUrl}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Copied!");
              }}
              className="shrink-0 p-1.5 bg-teal-100 hover:bg-teal-200 rounded-lg text-teal-600 transition-all duration-300 hover:scale-110"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 7-section display with icons */}
        <div className="space-y-4">
          {SECTIONS.map(({ key, label, icon: Icon }) =>
            data[key] ? (
              <div key={key} className="group animate-fadeIn">
                <p className="label flex items-center gap-2 text-slate-700 mb-2">
                  <Icon className="w-4 h-4 text-primary-500" />
                  {label}
                </p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 group-hover:border-primary-200 group-hover:bg-white transition-all duration-300 whitespace-pre-wrap">
                  {data[key]}
                </p>
              </div>
            ) : null,
          )}
        </div>

        {/* Import cross-exam questions with animation */}
        {data.crossExaminationQuestions && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 hover:border-violet-300 transition-all duration-300 animate-slideUp">
            <p className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-2">
              <div className="p-1 bg-violet-500 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              Cross-Examination Questions Extracted
            </p>
            <p className="text-xs text-violet-600 mb-3">
              These questions can be imported into a new Cross-Examination
              draft.
            </p>
            <a
              href={`/cross-exams/new`}
              className="inline-flex items-center gap-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Create Cross-Exam with these questions
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Tags with animations */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <p className="label mb-0 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-500" />
              Tags
            </p>
            <button
              onClick={() => setEditTags((v) => !v)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-300 hover:underline"
            >
              {editTags ? "Cancel" : "Edit tags"}
            </button>
          </div>
          {editTags ? (
            <div className="flex gap-2 animate-slideIn">
              <input
                className="input flex-1 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Criminal, Bail, High Court..."
              />
              <button
                onClick={saveTags}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.tags?.length > 0 ? (
                data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-primary-700 text-xs font-semibold border border-primary-200 hover:border-primary-300 hover:shadow-sm transition-all duration-300"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No tags yet</span>
              )}
            </div>
          )}
        </div>

        {/* Private notes with enhanced design */}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200">
          <p className="label flex items-center gap-2 mb-3">
            <StickyNote className="w-4 h-4 text-yellow-600" />
            Private Notes
          </p>
          <div className="space-y-2 mb-3">
            {(data.notes || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No notes yet. Add your private annotations here.
              </p>
            ) : (
              data.notes.map((note, index) => (
                <div
                  key={note._id}
                  className="flex gap-3 items-start bg-white border border-yellow-200 rounded-xl p-3 hover:shadow-md transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <StickyNote className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 flex-1 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <button
                    onClick={() => deleteNote(note._id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              className="textarea flex-1 h-20 text-xs rounded-xl border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
              placeholder="Add a private note or annotation..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button
              onClick={addNote}
              disabled={saving || !noteText.trim()}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Note"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Enhanced Add Entry Modal ───────────────────────────────────────────────────────────

function AddEntryModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    title: "",
    citation: "",
    courtName: "",
    judgementDate: "",
    pdfUrl: "",
    offenceName: "",
    lawsDiscussed: "",
    finalDecision: "",
    voiceSummary: "",
    tags: "",
    isMostImportant: false,
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.post("/api/library", { ...form, tags });
      toast.success("Judgement saved to library.");
      onAdded();
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Judgement to Library" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                step === s
                  ? "bg-primary-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              Step {s}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                  Title *
                </label>
                <input
                  className="input rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="e.g. State vs Ahmed Ali"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Citation</label>
                <input
                  className="input font-mono rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="e.g. 2015 SCMR 1002"
                  value={form.citation}
                  onChange={(e) =>
                    setForm({ ...form, citation: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary-500" />
                  Judgement Date
                </label>
                <input
                  type="date"
                  className="input rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  value={form.judgementDate}
                  onChange={(e) =>
                    setForm({ ...form, judgementDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">PDF Link</label>
                <input
                  type="url"
                  className="input rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="https://..."
                  value={form.pdfUrl}
                  onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label flex items-center gap-2">
                  <Gavel className="w-3.5 h-3.5 text-primary-500" />
                  Court Name
                </label>
                <select
                  className="select rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  value={form.courtName}
                  onChange={(e) =>
                    setForm({ ...form, courtName: e.target.value })
                  }
                >
                  <option value="">Select court...</option>
                  {COURTS.filter(Boolean).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Offence Name</label>
                <input
                  className="input rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="e.g. Possession under Section 9(c) CNSA 1997"
                  value={form.offenceName}
                  onChange={(e) =>
                    setForm({ ...form, offenceName: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Laws Discussed</label>
                <textarea
                  className="textarea h-20 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="Sections, articles, legal principles..."
                  value={form.lawsDiscussed}
                  onChange={(e) =>
                    setForm({ ...form, lawsDiscussed: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Final Decision</label>
                <textarea
                  className="textarea h-20 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="Verdict, conviction/acquittal, sentence..."
                  value={form.finalDecision}
                  onChange={(e) =>
                    setForm({ ...form, finalDecision: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Summary</label>
                <textarea
                  className="textarea h-24 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="Plain-language summary of the judgement..."
                  value={form.voiceSummary}
                  onChange={(e) =>
                    setForm({ ...form, voiceSummary: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary-500" />
                  Tags (comma-separated)
                </label>
                <input
                  className="input rounded-xl border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  placeholder="Criminal, Bail, High Court Precedent..."
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={form.isMostImportant}
                    onChange={(e) =>
                      setForm({ ...form, isMostImportant: e.target.checked })
                    }
                    className="w-5 h-5 accent-amber-500 rounded-lg"
                  />
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Mark as Most Important
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all duration-300"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save to Library"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
